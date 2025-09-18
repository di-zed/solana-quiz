/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { Router } from 'express';
import RestAuthController from '../../controllers/rest/authController';
import catchAsync from '../../errors/catchAsync';
import { authMiddleware } from '../../middlewares/authMiddleware';

/**
 * REST Auth Routes.
 */
class AuthRoutes {
  /**
   * REST Auth Controller.
   *
   * @protected
   */
  protected controller: RestAuthController = new RestAuthController();

  /**
   * Router.
   *
   * @protected
   */
  protected router: Router = Router();

  /**
   * Routes Constructor.
   */
  public constructor() {
    this.initRoutes();
  }

  /**
   * Routes Initialization.
   *
   * @returns void
   * @protected
   */
  protected initRoutes(): void {
    // GET
    this.router.route('/nonce').get(catchAsync(this.controller.nonce.bind(this.controller)));
    this.router.route('/me').get(authMiddleware, catchAsync(this.controller.me.bind(this.controller)));

    // POST
    this.router.route('/login').post(catchAsync(this.controller.login.bind(this.controller)));
  }

  /**
   * Get Router.
   *
   * @returns Router
   */
  public getRouter(): Router {
    return this.router;
  }
}

export default new AuthRoutes().getRouter();
