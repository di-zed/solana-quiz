import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai/openai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QuizService } from './quiz.service';

@Module({
  imports: [PrismaModule, OpenaiModule],
  providers: [QuizService],
})
export class QuizModule {}
