import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { HttpMetricsMiddleware } from './middlewares/http-metrics.middleware';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*');
  }
}
