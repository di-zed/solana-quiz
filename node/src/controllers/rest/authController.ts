/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import bs58 from 'bs58';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import AppError from '../../errors/appError';
import prismaProvider from '../../providers/prismaProvider';

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

    return res.status(200).json({ nonce });
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

    const token = jwt.sign({ id: user.id, wallet: user.walletAddress }, process.env.NODE_JWT_ACCESS_SECRET as string, {
      expiresIn: '1h',
    });

    const tlsKey: string = (process.env.NODE_TLS_KEY as string).trim();
    const tlsCert: string = (process.env.NODE_TLS_CERT as string).trim();
    const isSecure = tlsKey !== '' && tlsCert !== '';

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({ status: 'success' });
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
}
