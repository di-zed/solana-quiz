/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
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
   * GET Method.
   * URI for getting rewards.
   *
   * @param req
   * @param res
   * @param next
   */
  public async getRewards(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const rewardData = await quizService.getUserRewardData(req.currentUser.id);

    return res.status(200).json({
      status: 'success',
      data: rewardData,
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

    let correctOptionId = optionId;
    if (!quizAnswer.isCorrect) {
      const correctQuestionOption = await quizService.getCorrectQuestionOption(questionId);
      correctOptionId = correctQuestionOption ? correctQuestionOption.id : 0;
    }

    let earnedTokens = 0;
    const isQuizCompleted = await quizService.isQuizCompleted(req.currentUser.id, quizId);

    if (isQuizCompleted) {
      const quizData = await quizService.getUserQuizData(req.currentUser.id, quizId);
      const quizReward = await quizService.setUserReward(req.currentUser.id, quizId, quizData);

      if (quizReward && quizReward.earnedTokens > 0) {
        earnedTokens = quizReward.earnedTokens;

        await kafkaProvider.sendMessages({
          topic: 'solana-quiz-rewards',
          messages: [
            {
              key: `user_${req.currentUser.id}`,
              value: JSON.stringify({
                user_id: req.currentUser.id,
                user_wallet: req.currentUser.wallet,
                quiz_id: quizId,
                total_questions: quizReward.totalQuestions,
                correct_answers: quizReward.correctAnswers,
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
        isCorrectAnswer: quizAnswer.isCorrect,
        correctOptionId,
        selectedOptionId: optionId,
        isQuizCompleted,
        earnedTokens,
      },
    });
  }
}
