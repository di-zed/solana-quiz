/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../errors/appError';
import userService from '../services/userService';

/**
 * Auth Middleware.
 *
 * @param req
 * @param res
 * @param next
 * @returns Promise<void>
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authToken = req.cookies['auth_token'];
  if (!authToken) {
    return next(new AppError(res.__('You are not logged in! Please log in to get access.'), 401));
  }

  try {
    const authPayload = jwt.verify(authToken, process.env.NODE_JWT_ACCESS_SECRET as string) as TokenPayload;
    const currentUser = await userService.prepareCurrentUserById(authPayload.userId);

    if (!currentUser) {
      return next(new AppError(res.__('You are not logged in! Please log in to get access.'), 401));
    }

    req.currentUser = currentUser;
    return next();
  } catch {
    return next(new AppError(res.__('You are not logged in! Please log in to get access.'), 401));
  }
};

/**
 * Token Payload Type.
 */
export type TokenPayload = {
  userId: number;
};
