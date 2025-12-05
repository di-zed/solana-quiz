import { Injectable } from '@nestjs/common';
import { QuizAnswer } from '../../generated/prisma/client';
import { OpenaiService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerService } from './answer.service';
import { QuestionService } from './question.service';
import { RewardService } from './reward.service';
import { UserQuizDataDto } from './dto/user-quiz-data.dto';

@Injectable()
export class QuizService {
  public constructor(
    private prisma: PrismaService,
    private openAi: OpenaiService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private rewardService: RewardService,
  ) {}

  /**
   * Get Quiz ID.
   *
   * @returns number
   */
  public getQuizId(): number {
    const quizId = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return parseInt(quizId);
  }

  /**
   * Get Previous Quiz ID.
   *
   * @returns number
   */
  public getPrevQuizId(): number {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const quizId = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
    return parseInt(quizId);
  }

  /**
   * Is Quiz Completed?
   *
   * @param userId
   * @param quizId
   * @returns Promise<boolean>
   */
  public async isQuizCompleted(
    userId: number,
    quizId: number,
  ): Promise<boolean> {
    const [countQuestions, countAnswers] = await Promise.all([
      this.prisma.quizQuestion.count({
        where: { quizId },
      }),
      this.prisma.quizAnswer.count({
        where: { userId, quizId },
      }),
    ]);

    return countQuestions === countAnswers;
  }

  /**
   * Get User Quiz Data.
   *
   * @param userId
   * @param quizId
   * @returns Promise<UserQuizDataDto>
   */
  public async getUserQuizData(
    userId: number,
    quizId: number,
  ): Promise<UserQuizDataDto> {
    const result: UserQuizDataDto = {
      isCompleted: false,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      questions: [],
      earnedTokens: 0,
      streakDays: 0,
    };

    const [quizQuestions, quizAnswers] = await Promise.all([
      this.questionService.getQuestions(quizId),
      this.answerService.getUserAnswers(userId, quizId),
    ]);

    result.totalQuestions = quizQuestions.length;
    result.isCompleted = quizQuestions.length === quizAnswers.length;

    const questionAnswers: Record<number, QuizAnswer> = {};

    for (const quizAnswer of quizAnswers) {
      questionAnswers[quizAnswer.questionId] = quizAnswer;

      if (quizAnswer.isCorrect) {
        result.correctAnswers++;
      } else {
        result.wrongAnswers++;
      }
    }

    for (const quizQuestion of quizQuestions) {
      result.questions.push(
        this.questionService.toUserQuestion(
          quizQuestion,
          questionAnswers[quizQuestion.id] ?? null,
        ),
      );
    }

    if (result.isCompleted) {
      const quizReward = await this.rewardService.getUserReward(userId, quizId);

      if (quizReward) {
        result.earnedTokens = quizReward.earnedTokens;
        result.streakDays = quizReward.streakDays;
      }
    }

    return result;
  }
}
