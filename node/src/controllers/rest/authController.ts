/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import bs58 from 'bs58';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import AppError from '../../errors/appError';
import { TokenPayload } from '../../middlewares/authMiddleware';
import prismaProvider from '../../providers/prismaProvider';
import userService from '../../services/userService';

/**
 * REST Auth Controller.
 */
export default class AuthController {
  /**
   * Nonces that have already been provided.
   *
   * @protected
   */
  protected nonces = new Map();

  /**
   * GET Method.
   * Get nonce for signature.
   *
   * @param req
   * @param res
   * @returns Response
   */
  public async nonce(req: Request, res: Response): Promise<Response> {
    const nonce = Math.floor(Math.random() * 1e9).toString();
    this.nonces.set(nonce, true);

    return res.status(200).json({ status: 'success', nonce });
  }

  /**
   * POST Method.
   * Login.
   *
   * @param req
   * @param res
   * @param next
   * @returns Response
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { walletAddress, signature, nonce } = req.body;

    if (!walletAddress || !signature || !nonce) {
      return next(new AppError('Invalid request', 400));
    }

    if (!this.nonces.has(nonce)) {
      return next(new AppError('Invalid nonce', 400));
    }
    this.nonces.delete(nonce);

    const message = new TextEncoder().encode(`Login nonce: ${nonce}`);
    const sigBytes = bs58.decode(signature);
    const pubKeyBytes = bs58.decode(walletAddress);

    const isValid = nacl.sign.detached.verify(message, sigBytes, pubKeyBytes);
    if (!isValid) {
      return next(new AppError('Invalid signature', 401));
    }

    const user = await prismaProvider.getClient().user.upsert({
      where: { walletAddress: walletAddress },
      create: { walletAddress: walletAddress },
      update: { lastLoginAt: new Date() },
    });

    this.updateTokens(res, user.id);

    return res.status(200).json({ status: 'success' });
  }

  /**
   * POST Method.
   * Logout.
   *
   * @param req
   * @param res
   * @param next
   * @returns Response
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    if (!this.removeTokens(res)) {
      return next(new AppError(res.__('You are not logged in! Please log in to get access.'), 401));
    }

    return res.status(200).json({ status: 'success' });
  }

  /**
   * POST Method.
   * Refresh Token.
   *
   * @param req
   * @param res
   * @param next
   * @returns Response
   */
  public async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return next(new AppError(res.__('The refresh token is not valid.'), 401));
    }

    try {
      const refreshPayload = jwt.verify(refreshToken, process.env.NODE_JWT_REFRESH_SECRET as string) as TokenPayload;
      this.updateTokens(res, refreshPayload.userId);

      const currentUser = userService.prepareCurrentUserById(refreshPayload.userId);
      if (!currentUser) {
        return next(new AppError(res.__('The refresh token is not valid.'), 401));
      }

      return res.status(200).json({
        status: 'success',
        data: {
          user: currentUser,
        },
      });
    } catch {
      return next(new AppError(res.__('The refresh token is not valid.'), 401));
    }
  }

  /**
   * GET Method.
   * URI for getting current user.
   *
   * @param req
   * @param res
   * @param next
   * @returns Response | void
   */
  public async me(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return res.status(200).json({
      status: 'success',
      data: {
        user: req.currentUser,
      },
    });
  }

  /**
   * Update Tokens.
   *
   * @param res
   * @param userId
   * @returns boolean
   * @protected
   */
  protected updateTokens(res: Response, userId: number): boolean {
    try {
      const authToken = jwt.sign(<TokenPayload>{ userId: userId }, process.env.NODE_JWT_ACCESS_SECRET as string, {
        expiresIn: '1h',
      });
      const refreshToken = jwt.sign(<TokenPayload>{ userId: userId }, process.env.NODE_JWT_REFRESH_SECRET as string, {
        expiresIn: '30d',
      });

      const tlsKey: string = (process.env.NODE_TLS_KEY as string).trim();
      const tlsCert: string = (process.env.NODE_TLS_CERT as string).trim();
      const isSecure = tlsKey !== '' && tlsCert !== '';

      res.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove Tokens.
   *
   * @param res
   * @returns boolean
   * @protected
   */
  protected removeTokens(res: Response): boolean {
    try {
      const tlsKey: string = (process.env.NODE_TLS_KEY as string).trim();
      const tlsCert: string = (process.env.NODE_TLS_CERT as string).trim();
      const isSecure = tlsKey !== '' && tlsCert !== '';

      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
      });

      return true;
    } catch {
      return false;
    }
  }
}
