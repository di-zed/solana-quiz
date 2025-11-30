import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRequiredEnv } from './common/utils/config.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(getRequiredEnv('NODE_CONTAINER_PORT'));
}

void bootstrap();
