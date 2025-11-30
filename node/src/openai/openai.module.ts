import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Module({
  exports: [OpenaiService],
  providers: [OpenaiService],
})
export class OpenaiModule {}
