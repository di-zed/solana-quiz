import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class ExecutionTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExecutionTimeInterceptor.name);
  private readonly threshold = 3000; // 3 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;

        if (elapsed > this.threshold) {
          const ctx = context.switchToHttp();
          const request = ctx.getRequest<Request>();

          const method = request?.method;
          const url = request?.url;

          this.logger.warn(
            `Slow request detected: ${method} ${url} took ${elapsed}ms`,
          );
        }
      }),
    );
  }
}
