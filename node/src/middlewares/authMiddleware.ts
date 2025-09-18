/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../errors/appError';

/**
 * Auth Middleware.
 *
 * @param req
 * @param res
 * @param next
 * @returns void
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies['auth_token'];
  if (!token) {
    return next(new AppError(res.__('You are not logged in! Please log in to get access.'), 401));
  }

  try {
    req.currentUser = jwt.verify(token, process.env.NODE_JWT_ACCESS_SECRET as string) as CurrentUser;
    return next();
  } catch {
    return next(new AppError(res.__('You are not logged in! Please log in to get access.'), 401));
  }
};

/**
 * Authenticated User Type.
 */
export type CurrentUser = {
  id: Number;
  wallet: String;
};
