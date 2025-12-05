import { Injectable } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiQuestion } from './types/ai-question.type';
import {
  QuizAnswer,
  QuizQuestion,
  QuizQuestionOption,
} from '../../generated/prisma/client';
import { UserQuizQuestionDto } from './dto/user-quiz-question.dto';
import { UserQuizQuestionOptionDto } from './dto/user-quiz-question-option.dto';
import { QuizQuestionOptionCreateWithoutQuestionInput } from '../../generated/prisma/models/QuizQuestionOption';

@Injectable()
export class QuestionService {
  public constructor(
    private prisma: PrismaService,
    private openAi: OpenaiService,
  ) {}

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
  public async getQuestionsFromDb(quizId: number): Promise<QuizQuestion[]> {
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
  public async getQuestions(quizId: number): Promise<QuizQuestion[]> {
    const dbQuestions = await this.getQuestionsFromDb(quizId);

    if (dbQuestions.length === 0) {
      const aiQuestions = await this.getQuestionsFromAi();

      for (const aiQuestion of aiQuestions) {
        const quizQuestionOptions: QuizQuestionOptionCreateWithoutQuestionInput[] =
          [];

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
   * Convert Quiz Question to User Question.
   *
   * @param quizQuestion
   * @param quizAnswer
   * @returns UserQuizQuestionDto
   */
  public toUserQuestion(
    quizQuestion: QuizQuestion & { options?: QuizQuestionOption[] },
    quizAnswer: QuizAnswer | null,
  ): UserQuizQuestionDto {
    const options: UserQuizQuestionOptionDto[] =
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
}
