import { ValidationPipe } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as fs from 'fs';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getRequiredEnv } from './common/utils/config.utils';
import { getKafkaConsumerConfig } from './kafka/kafka.config';

async function bootstrap() {
  const options: NestApplicationOptions = {};

  // Read TLS key/cert paths from env
  const tlsKeyPath = process.env.NODE_TLS_KEY?.trim();
  const tlsCertPath = process.env.NODE_TLS_CERT?.trim();

  // Enable HTTPS if both TLS key and cert are provided
  if (tlsKeyPath && tlsCertPath) {
    options.httpsOptions = {
      key: fs.readFileSync(tlsKeyPath),
      cert: fs.readFileSync(tlsCertPath),
    };
  }

  const app = await NestFactory.create(AppModule, options);

  // Parse cookies for auth
  app.use(cookieParser());

  // Parse JSON bodies with size limit
  app.use(express.json({ limit: '10kb' }));

  // Allow frontend to access API with cookies
  app.enableCors({
    origin: getRequiredEnv('FRONT_PUBLIC_URL'),
    credentials: true,
  });

  // Basic security headers
  app.use(
    helmet({
      hidePoweredBy: true,
      hsts: getRequiredEnv('NODE_ENV') === 'production',
    }),
  );

  // Prefix for all routes: /v1/*
  app.setGlobalPrefix('v1', {
    exclude: ['/metrics', '/metrics/alert'],
  });

  // Validate DTOs and sanitize input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Solana Quiz API')
    .setDescription('API documentation for the Solana Quiz project')
    .setVersion('1.0')
    .addCookieAuth('auth_token')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Attach Kafka as a microservice using the shared config.
  app.connectMicroservice(getKafkaConsumerConfig(app.get(ConfigService)));

  // Start Kafka consumers and begin listening to topics.
  // await app.startAllMicroservices();

  // Start server
  await app.listen(getRequiredEnv('NODE_CONTAINER_PORT'));
}

void bootstrap();
