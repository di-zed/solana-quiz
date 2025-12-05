import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuizAnswer } from '../../generated/prisma/client';

@Injectable()
export class AnswerService {
  public constructor(private prisma: PrismaService) {}

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
    quizId: number,
  ): Promise<QuizAnswer[]> {
    return this.prisma.quizAnswer.findMany({
      where: { userId, quizId },
    });
  }
}
