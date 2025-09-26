/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { QuizQuestion, QuizQuestionOption } from '@prisma/client';
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
   * @returns Promise<QuizQuestion[]>
   */
  public async getQuestionsFromDb(): Promise<QuizQuestion[]> {
    return await prismaProvider.getClient().quizQuestion.findMany({
      where: { quizId: this.getQuizId() },
      include: { options: true },
    });
  }

  /**
   * Get Questions.
   *
   * @returns Promise<QuizQuestion[]>
   */
  public async getQuestions(): Promise<QuizQuestion[]> {
    const dbQuestions = await this.getQuestionsFromDb();

    if (dbQuestions.length === 0) {
      const quizId = this.getQuizId();
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
   * Get DTO (Data Transfer Object) Questions.
   *
   * @returns Promise<DtoQuestion[]>
   */
  public async getDtoQuestions(): Promise<DtoQuestion[]> {
    const result = [];
    const questions = await this.getQuestions();

    for (const question of questions) {
      result.push(this.toQuizQuestionDto(question));
    }

    return result;
  }

  /**
   * Convert Quiz Question to DTO Question.
   *
   * @param quizQuestion
   * @returns DtoQuestion
   */
  public toQuizQuestionDto(quizQuestion: QuizQuestion): DtoQuestion {
    const options =
      (quizQuestion as any).options?.map((quizQuestionOption: QuizQuestionOption) => ({
        id: quizQuestionOption.id,
        option: quizQuestionOption.option,
      })) || [];

    return {
      id: quizQuestion.id,
      question: quizQuestion.question,
      options: options,
    };
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
 * DTO Question Option Type.
 */
type DtoQuestionOption = {
  id: number;
  option: string;
};

/**
 * DTO Question Type.
 */
type DtoQuestion = {
  id: number;
  question: string;
  options: DtoQuestionOption[];
};

export default new QuizService();
