import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { OpenaiModule } from '../openai/openai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RewardConsumerController } from './consumers/reward-consumer.controller';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuestionService } from './question.service';
import { RewardService } from './reward.service';
import { AnswerService } from './answer.service';
import { QuizTasksService } from './quiz-tasks.service';
import { QuizAnswerService } from './quiz-answer.service';

@Module({
  imports: [PrismaModule, OpenaiModule, KafkaModule],
  exports: [QuizService, QuestionService],
  providers: [
    QuizService,
    QuestionService,
    RewardService,
    AnswerService,
    QuizTasksService,
    QuizAnswerService,
  ],
  controllers: [QuizController, RewardConsumerController],
})
export class QuizModule {}
