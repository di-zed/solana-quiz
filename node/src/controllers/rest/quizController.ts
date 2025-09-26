/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { NextFunction, Request, Response } from 'express';
import quizService from '../../services/quizService';

/**
 * REST Auth Controller.
 */
export default class AuthController {
  /**
   * GET Method.
   * URI for getting questions.
   *
   * @param req
   * @param res
   * @param next
   */
  public async getQuestions(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const questions = await quizService.getDtoQuestions();

    return res.status(200).json({
      status: 'success',
      data: {
        questions,
      },
    });
  }
}
