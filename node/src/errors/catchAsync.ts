/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { NextFunction, Request, Response } from 'express';

/**
 * Wrap asynchronous methods to automatically catch exceptions.
 *
 * @param fn
 * @returns any
 */
export default function (fn: Function): any {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch(next);
  };
}
