import { Injectable } from '@nestjs/common';
import {
  QuizAnswer,
  QuizQuestion,
  QuizQuestionOption,
  QuizReward,
} from '../../generated/prisma/client';
import { getRequiredEnv } from '../common/utils/config.utils';
import { OpenaiService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiQuestion } from './types/ai-question.type';
import { UserQuizData } from './types/user-quiz-data.type';
import { UserQuizQuestionOption } from './types/user-quiz-question-option.type';
import { UserQuizQuestion } from './types/user-quiz-question.type';
import { UserRewardData } from './types/user-reward-data.type';
import { UserReward } from './types/user-reward.type';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private openAi: OpenaiService,
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
   * Get Questions from AI.
   *
   * @returns Promise<AiQuestion[]>
   */
  public async getQuestionsFromAi(): Promise<AiQuestion[]> {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

    const result = await this.openAi.responseCreate(
      'Generate 5 quiz questions with 4 answer options each.' +
        'Theme: Important events and fun facts related to ' +
        today +
        '.' +
        '      Format strictly as JSON:\n' +
        '      [\n' +
        '        {\n' +
        '            "question": "string",\n' +
        '            "options": ["string", "string", "string", "string"],\n' +
        '            "answer": "string"\n' +
        '          }\n' +
        '      ]' +
        'Return only JSON, do not include any markdown or explanations.',
      0.7,
    );

    return JSON.parse(result) as AiQuestion[];
  }

  /**
   * Get Questions from DB.
   *
   * @param quizId
   * @returns Promise<QuizQuestion[]>
   */
  public async getQuestionsFromDb(
    quizId: number = this.getQuizId(),
  ): Promise<QuizQuestion[]> {
    return this.prisma.quizQuestion.findMany({
      where: { quizId },
      include: {
        options: {
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Get Questions.
   *
   * @param quizId
   * @returns Promise<QuizQuestion[]>
   */
  public async getQuestions(
    quizId: number = this.getQuizId(),
  ): Promise<QuizQuestion[]> {
    const dbQuestions = await this.getQuestionsFromDb(quizId);

    if (dbQuestions.length === 0) {
      const aiQuestions = await this.getQuestionsFromAi();

      for (const aiQuestion of aiQuestions) {
        const quizQuestionOptions = [];

        for (const aiQuestionOption of aiQuestion.options) {
          quizQuestionOptions.push({
            option: aiQuestionOption,
          });
        }

        const quizQuestion = await this.prisma.quizQuestion.create({
          data: {
            quizId,
            question: aiQuestion.question,
            answer: aiQuestion.answer,
            options: {
              create: quizQuestionOptions,
            },
          },
          include: { options: true },
        });

        dbQuestions.push(quizQuestion);
      }
    }

    return dbQuestions;
  }

  /**
   * Get Correct Question Option.
   *
   * @param questionId
   * @returns Promise<QuizQuestionOption | null>
   */
  public async getCorrectQuestionOption(
    questionId: number,
  ): Promise<QuizQuestionOption | null> {
    const quizQuestion = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (quizQuestion) {
      for (const quizQuestionOption of quizQuestion.options) {
        if (quizQuestionOption.option === quizQuestion.answer) {
          return quizQuestionOption;
        }
      }
    }

    return null;
  }

  /**
   * Set User Answer.
   *
   * @param userId
   * @param quizId
   * @param questionId
   * @param optionId
   * @returns Promise<QuizAnswer | null>
   */
  public async setUserAnswer(
    userId: number,
    quizId: number,
    questionId: number,
    optionId: number,
  ): Promise<QuizAnswer | null> {
    const quizAnswer = await this.prisma.quizAnswer.findFirst({
      where: { userId, quizId, questionId },
    });

    // The user cannot answer the same question twice.
    if (quizAnswer) {
      return null;
    }

    const quizQuestion = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
    if (!quizQuestion || quizQuestion.quizId !== quizId) {
      return null;
    }

    let isValidOptionId = false;
    let isCorrect = false;

    for (const quizQuestionOption of quizQuestion.options) {
      if (quizQuestionOption.id === optionId) {
        isValidOptionId = true;
        isCorrect = quizQuestionOption.option === quizQuestion.answer;
        break;
      }
    }

    if (!isValidOptionId) {
      return null;
    }

    return this.prisma.quizAnswer.create({
      data: {
        userId,
        quizId,
        questionId,
        optionId,
        isCorrect,
      },
    });
  }

  /**
   * Get User Answers.
   *
   * @param userId
   * @param quizId
   * @returns Promise<QuizAnswer[]>
   */
  public async getUserAnswers(
    userId: number,
    quizId: number = this.getQuizId(),
  ): Promise<QuizAnswer[]> {
    return this.prisma.quizAnswer.findMany({
      where: { userId, quizId },
    });
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
    quizId: number = this.getQuizId(),
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
   * @returns Promise<UserQuizData>
   */
  public async getUserQuizData(
    userId: number,
    quizId: number = this.getQuizId(),
  ): Promise<UserQuizData> {
    const result: UserQuizData = {
      isCompleted: false,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      questions: [],
      earnedTokens: 0,
      streakDays: 0,
    };

    const [quizQuestions, quizAnswers] = await Promise.all([
      this.getQuestions(quizId),
      this.getUserAnswers(userId, quizId),
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
        this.toUserQuestion(
          quizQuestion,
          questionAnswers[quizQuestion.id] ?? null,
        ),
      );
    }

    if (result.isCompleted) {
      const quizReward = await this.getUserReward(userId, quizId);

      if (quizReward) {
        result.earnedTokens = quizReward.earnedTokens;
        result.streakDays = quizReward.streakDays;
      }
    }

    return result;
  }

  /**
   * Convert Quiz Question to User Question.
   *
   * @param quizQuestion
   * @param quizAnswer
   * @returns UserQuizQuestion
   */
  public toUserQuestion(
    quizQuestion: QuizQuestion & { options: QuizQuestionOption[] },
    quizAnswer: QuizAnswer | null,
  ): UserQuizQuestion {
    const options: UserQuizQuestionOption[] =
      quizQuestion.options?.map((quizQuestionOption: QuizQuestionOption) => ({
        id: quizQuestionOption.id,
        option: quizQuestionOption.option,
      })) || [];

    return {
      id: quizQuestion.id,
      question: quizQuestion.question,
      isAnswered: quizAnswer !== null,
      isCorrect: quizAnswer !== null ? quizAnswer.isCorrect : false,
      options: options,
    };
  }

  /**
   * Get User Reward.
   *
   * @param userId
   * @param quizId
   * @returns Promise<QuizReward | null>
   */
  public async getUserReward(
    userId: number,
    quizId: number,
  ): Promise<QuizReward | null> {
    return this.prisma.quizReward.findFirst({
      where: { userId, quizId },
    });
  }

  /**
   * Set User Reward.
   *
   * @param userId
   * @param quizId
   * @param quizData
   * @returns Promise<QuizReward | null>
   */
  public async setUserReward(
    userId: number,
    quizId: number,
    quizData: UserQuizData,
  ): Promise<QuizReward | null> {
    if (
      quizData.totalQuestions !==
      quizData.correctAnswers + quizData.wrongAnswers
    ) {
      return null;
    }

    // A user cannot be awarded for the same quiz twice.
    if (await this.getUserReward(userId, quizId)) {
      return null;
    }

    return this.prisma.quizReward.create({
      data: {
        userId,
        quizId,
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers,
        wrongAnswers: quizData.wrongAnswers,
        earnedTokens: this.calculateQuizReward(quizData),
        streakDays: await this.calculateQuizStreakDays(userId, quizData),
        isSent: false,
      },
    });
  }

  /**
   * Get User Rewards.
   *
   * @param userId
   * @returns Promise<QuizReward[]>
   */
  public async getUserRewards(userId: number): Promise<QuizReward[]> {
    return this.prisma.quizReward.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Mark Reward As Sent.
   *
   * @param userId
   * @param quizId
   * @returns Promise<QuizReward | null>
   */
  public async markRewardAsSent(
    userId: number,
    quizId: number,
  ): Promise<QuizReward | null> {
    const quizReward = await this.prisma.quizReward.findFirst({
      where: { userId, quizId },
    });

    // The reward cannot be sent twice.
    if (quizReward && quizReward.isSent) {
      return null;
    }

    return this.prisma.quizReward.update({
      where: { userId_quizId: { userId, quizId } },
      data: { isSent: true, sentAt: new Date() },
    });
  }

  /**
   * Calculate Quiz Reward.
   *
   * @param quizData
   * @returns number
   */
  public calculateQuizReward(quizData: UserQuizData): number {
    if (
      quizData.totalQuestions !==
      quizData.correctAnswers + quizData.wrongAnswers
    ) {
      return 0;
    }

    // One token to one correct answer
    let reward = quizData.correctAnswers;

    // If all answers are correct, the reward will be doubled
    if (quizData.totalQuestions === quizData.correctAnswers) {
      reward *= 2;
    }

    return reward;
  }

  /**
   * Calculate Quiz Streak Days.
   *
   * @param userId
   * @param quizData
   * @returns Promise<number>
   */
  public async calculateQuizStreakDays(
    userId: number,
    quizData: UserQuizData,
  ): Promise<number> {
    if (quizData.totalQuestions !== quizData.correctAnswers) {
      return 0;
    }

    let streakDays = 1;

    const prevReward = await this.getUserReward(userId, this.getPrevQuizId());
    if (prevReward) {
      streakDays += prevReward.streakDays;
      const goalStreakDays = parseInt(getRequiredEnv('SOLANA_STREAK_DAYS'));

      if (streakDays > goalStreakDays) {
        streakDays = 1;
      }
    }

    return streakDays;
  }

  /**
   * Get User Reward Data.
   *
   * @param userId
   * @returns Promise<UserQuizData>
   */
  public async getUserRewardData(userId: number): Promise<UserRewardData> {
    const result: UserRewardData = {
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      earnedTokens: 0,
      streaks: 0,
      rewards: [],
    };

    const rewards = await this.getUserRewards(userId);

    for (const reward of rewards) {
      const goalStreakDays = parseInt(getRequiredEnv('SOLANA_STREAK_DAYS'));

      const userReward: UserReward = {
        date: new Date(reward.createdAt).toISOString().split('T')[0],
        totalQuestions: reward.totalQuestions,
        correctAnswers: reward.correctAnswers,
        wrongAnswers: reward.wrongAnswers,
        earnedTokens: reward.earnedTokens,
        streakDays: reward.streakDays,
        isSent: reward.isSent,
      };

      result.totalQuizzes++;

      result.totalQuestions += userReward.totalQuestions;
      result.correctAnswers += userReward.correctAnswers;
      result.wrongAnswers += userReward.wrongAnswers;
      result.earnedTokens += userReward.earnedTokens;
      result.streaks += userReward.streakDays === goalStreakDays ? 1 : 0;

      result.rewards.push(userReward);
    }

    return result;
  }
}
