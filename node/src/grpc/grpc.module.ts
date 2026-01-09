import { Module } from '@nestjs/common';
import { QuizModule } from '../quiz/quiz.module';
import { QuizController } from './quiz.controller';

@Module({
  controllers: [QuizController],
  imports: [QuizModule],
})
export class GrpcModule {}
