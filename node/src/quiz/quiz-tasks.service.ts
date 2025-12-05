import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuestionService } from './question.service';
import { QuizService } from './quiz.service';

@Injectable()
export class QuizTasksService {
  public constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async loadQuizQuestions(): Promise<void> {
    await this.questionService.getQuestions(this.quizService.getQuizId());
  }
}
