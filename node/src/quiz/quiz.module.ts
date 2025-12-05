import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai/openai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuestionService } from './question.service';
import { RewardService } from './reward.service';
import { AnswerService } from './answer.service';

@Module({
  imports: [PrismaModule, OpenaiModule],
  providers: [QuizService, QuestionService, RewardService, AnswerService],
  controllers: [QuizController],
})
export class QuizModule {}
