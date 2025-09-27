/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { Router } from 'express';
import RestQuizController from '../../controllers/rest/quizController';
import catchAsync from '../../errors/catchAsync';
import { authMiddleware } from '../../middlewares/authMiddleware';

/**
 * REST Quiz Routes.
 */
class QuizRoutes {
  /**
   * REST Quiz Controller.
   *
   * @protected
   */
  protected controller: RestQuizController = new RestQuizController();

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
    this.router.route('/questions').get(catchAsync(authMiddleware), catchAsync(this.controller.getQuestions.bind(this.controller)));

    // POST
    this.router.route('/answer').post(catchAsync(authMiddleware), catchAsync(this.controller.setAnswer.bind(this.controller)));
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

export default new QuizRoutes().getRouter();
