/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { Request, Response } from 'express';

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
   * @returns Response
   */
  public async login(req: Request, res: Response): Promise<Response> {
    return res.status(200).json();
  }
}
