/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { QuizAnswer, QuizReward, QuizQuestion, QuizQuestionOption } from '@prisma/client';
import openAiProvider from '../providers/openAiProvider';
import prismaProvider from '../providers/prismaProvider';

/**
 * Quiz Service.
 */
class QuizService {
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
   * Get Questions from AI.
   *
   * @returns Promise<AiQuestion[]>
   */
  public async getQuestionsFromAi(): Promise<AiQuestion[]> {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const result = await openAiProvider.responseCreate(
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
  public async getQuestionsFromDb(quizId: number = this.getQuizId()): Promise<QuizQuestion[]> {
    return await prismaProvider.getClient().quizQuestion.findMany({
      where: { quizId },
      include: { options: true },
    });
  }

  /**
   * Get Questions.
   *
   * @param quizId
   * @returns Promise<QuizQuestion[]>
   */
  public async getQuestions(quizId: number = this.getQuizId()): Promise<QuizQuestion[]> {
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

        const quizQuestion = await prismaProvider.getClient().quizQuestion.create({
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
   * Set User Answer.
   *
   * @param userId
   * @param quizId
   * @param questionId
   * @param optionId
   * @returns Promise<QuizAnswer | null>
   */
  public async setUserAnswer(userId: number, quizId: number, questionId: number, optionId: number): Promise<QuizAnswer | null> {
    const quizAnswer = await prismaProvider.getClient().quizAnswer.findFirst({
      where: { userId, quizId, questionId },
    });

    // The user cannot answer the same question twice.
    if (quizAnswer) {
      return null;
    }

    const quizQuestion = await prismaProvider.getClient().quizQuestion.findUnique({
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

    return await prismaProvider.getClient().quizAnswer.create({
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
  public async getUserAnswers(userId: number, quizId: number = this.getQuizId()): Promise<QuizAnswer[]> {
    return await prismaProvider.getClient().quizAnswer.findMany({
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
  public async isQuizCompleted(userId: number, quizId: number = this.getQuizId()): Promise<boolean> {
    const prisma = prismaProvider.getClient();

    const [countQuestions, countAnswers] = await Promise.all([
      prisma.quizQuestion.count({
        where: { quizId },
      }),
      prisma.quizAnswer.count({
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
  public async getUserQuizData(userId: number, quizId: number = this.getQuizId()): Promise<UserQuizData> {
    const result: UserQuizData = {
      isCompleted: false,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      questions: [],
    };

    const quizQuestions = await this.getQuestions(quizId);
    const quizAnswers = await this.getUserAnswers(userId, quizId);

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
      result.questions.push(this.toUserQuestion(quizQuestion, questionAnswers[quizQuestion.id] ?? null));
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
  public toUserQuestion(quizQuestion: QuizQuestion, quizAnswer: QuizAnswer | null): UserQuizQuestion {
    const options =
      (quizQuestion as any).options?.map(
        (quizQuestionOption: QuizQuestionOption) =>
          ({
            id: quizQuestionOption.id,
            option: quizQuestionOption.option,
          }) as UserQuizQuestionOption,
      ) || [];

    return {
      id: quizQuestion.id,
      question: quizQuestion.question,
      isAnswered: quizAnswer !== null,
      isCorrect: quizAnswer !== null ? quizAnswer.isCorrect : false,
      options: options,
    };
  }

  /**
   * Set User Reward.
   *
   * @param userId
   * @param quizId
   * @param quizData
   * @returns Promise<QuizReward | null>
   */
  public async setUserReward(userId: number, quizId: number, quizData: UserQuizData): Promise<QuizReward | null> {
    if (quizData.totalQuestions !== quizData.correctAnswers + quizData.wrongAnswers) {
      return null;
    }

    const quizReward = await prismaProvider.getClient().quizReward.findFirst({
      where: { userId, quizId },
    });

    // A user cannot be awarded for the same quiz twice.
    if (quizReward) {
      return null;
    }

    return await prismaProvider.getClient().quizReward.create({
      data: {
        userId,
        quizId,
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers,
        wrongAnswers: quizData.wrongAnswers,
        earnedTokens: this.calculateQuizReward(quizData),
        isSent: false,
      },
    });
  }

  /**
   * Mark Reward As Sent.
   *
   * @param userId
   * @param quizId
   * @returns Promise<QuizReward | null>
   */
  public async markRewardAsSent(userId: number, quizId: number): Promise<QuizReward | null> {
    const quizReward = await prismaProvider.getClient().quizReward.findFirst({
      where: { userId, quizId },
    });

    // The reward cannot be sent twice.
    if (quizReward && quizReward.isSent) {
      return null;
    }

    return await prismaProvider.getClient().quizReward.update({
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
    if (quizData.totalQuestions !== quizData.correctAnswers + quizData.wrongAnswers) {
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
}

/**
 * AI Question Type.
 */
type AiQuestion = {
  question: string;
  options: string[];
  answer: string;
};

/**
 * User Quiz Question Option Type.
 */
type UserQuizQuestionOption = {
  id: number;
  option: string;
};

/**
 * User Quiz Question Type.
 */
type UserQuizQuestion = {
  id: number;
  question: string;
  isAnswered: boolean;
  isCorrect: boolean;
  options: UserQuizQuestionOption[];
};

/**
 * User Quiz Data Type.
 */
type UserQuizData = {
  isCompleted: boolean;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  questions: UserQuizQuestion[];
};

export default new QuizService();
