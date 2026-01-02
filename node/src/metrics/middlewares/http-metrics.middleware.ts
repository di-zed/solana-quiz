import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { httpRequestDurationSeconds } from '../metrics/http.metrics';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.originalUrl.startsWith('/metrics')) {
      return next();
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const diffNs = Number(process.hrtime.bigint() - start);
      const durationSeconds = diffNs / 1e9;

      const route = req.originalUrl.split('?')[0];

      httpRequestDurationSeconds.observe(
        {
          method: req.method,
          route,
        },
        durationSeconds,
      );
    });

    next();
  }
}
