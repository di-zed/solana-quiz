import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { MetricsController } from './metrics/metrics.controller';
import { QuizModule } from './quiz/quiz.module';
import { KafkaModule } from './kafka/kafka.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrometheusModule.register({
      controller: MetricsController,
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    QuizModule,
    KafkaModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
