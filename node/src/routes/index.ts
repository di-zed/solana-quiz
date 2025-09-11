/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { Application, NextFunction, Request, Response } from 'express';
import AppError from '../errors/appError';
import errorHandler from '../errors/handler';

/**
 * Loading Routes.
 */
export default class Routes {
  /**
   * Routes Constructor.
   *
   * @param app
   */
  public constructor(app: Application) {
    // Other URLs.
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
      next(new AppError(res.__('Can not find "%s" on this server!', req.originalUrl), 404));
    });

    app.use(errorHandler);
  }
}
