import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetQuestionsRequest } from './proto/solana_quiz/v1/ts/question';
import { QuestionService } from '../quiz/question.service';
import { QuizService } from '../quiz/quiz.service';

@Controller()
export class QuizController {
  public constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
  ) {}

  @GrpcMethod('QuizService', 'GetQuizId')
  public getQuizId() {
    return { quizId: this.quizService.getQuizId() };
  }

  @GrpcMethod('QuestionService', 'GetQuestions')
  public async getQuestions(data: GetQuestionsRequest) {
    const questions = await this.questionService.getQuestions(data.quizId);

    return { questions };
  }
}
