/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { NextFunction, Request, Response } from 'express';
import AppError from '../../errors/appError';
import quizService from '../../services/quizService';
import numberUtil from '../../utils/numberUtil';

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
    const quizData = await quizService.getUserQuizData(req.currentUser.id);

    return res.status(200).json({
      status: 'success',
      data: quizData,
    });
  }

  /**
   * POST Method.
   * URI for setting an answer.
   *
   * @param req
   * @param res
   * @param next
   */
  public async setAnswer(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const quizId = numberUtil.toPositiveInt(req.body.quizId);
    const questionId = numberUtil.toPositiveInt(req.body.questionId);
    const optionId = numberUtil.toPositiveInt(req.body.optionId);

    if (!quizId || !questionId || !optionId) {
      return next(new AppError('Invalid payload: quizId, questionId and optionId must be positive integers.', 400));
    }

    const quizAnswer = await quizService.setUserAnswer(req.currentUser.id, quizId, questionId, optionId);
    if (!quizAnswer) {
      return next(new AppError('Invalid request.', 400));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        isCorrect: quizAnswer.isCorrect,
      },
    });
  }
}
