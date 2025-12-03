import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRequiredEnv } from './common/utils/config.utils';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: getRequiredEnv('FRONT_PUBLIC_URL'),
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Solana Quiz API')
    .setDescription('API documentation for the Solana Quiz project')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('quiz')
    .addCookieAuth('auth_token', {
      type: 'apiKey',
      in: 'cookie',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(getRequiredEnv('NODE_CONTAINER_PORT'));
}

void bootstrap();
