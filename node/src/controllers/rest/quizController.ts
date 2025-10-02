/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { QuizReward } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import AppError from '../../errors/appError';
import kafkaProvider from '../../providers/kafkaProvider';
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
    const questionId = numberUtil.toPositiveInt(req.body.questionId);
    const optionId = numberUtil.toPositiveInt(req.body.optionId);

    if (!questionId || !optionId) {
      return next(new AppError('Invalid payload: questionId and optionId must be positive integers.', 400));
    }

    const quizId = quizService.getQuizId();

    const quizAnswer = await quizService.setUserAnswer(req.currentUser.id, quizId, questionId, optionId);
    if (!quizAnswer) {
      return next(new AppError('Invalid request.', 400));
    }

    if (await quizService.isQuizCompleted(req.currentUser.id, quizId)) {
      const quizData = await quizService.getUserQuizData(req.currentUser.id, quizId);
      const quizReward = await quizService.setUserReward(req.currentUser.id, quizId, quizData);

      if (quizReward) {
        await kafkaProvider.sendMessages({
          topic: 'solana-quiz-rewards',
          messages: [
            {
              key: `user_${req.currentUser.id}`,
              value: JSON.stringify({
                user_id: req.currentUser.id,
                user_wallet: req.currentUser.wallet,
                quiz_id: quizId,
                earned_tokens: quizReward.earnedTokens,
              }),
            },
          ],
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        isCorrect: quizAnswer.isCorrect,
      },
    });
  }
}
