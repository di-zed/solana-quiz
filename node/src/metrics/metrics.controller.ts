import { Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { Alert } from './types/alert.type';

@Controller('metrics')
@ApiExcludeController()
export class MetricsController extends PrometheusController {
  private readonly logger = new Logger(MetricsController.name);

  @Public()
  @Get()
  public async index(
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    return super.index(response);
  }

  @Public()
  @Post('alert')
  public async alert(@Req() req: Request): Promise<void> {
    const alerts = (req.body.alerts ?? []) as Alert[];

    alerts.forEach((alert) => {
      const { labels, annotations, status } = alert;

      const target = labels.instance ?? labels.route ?? 'unknown';

      const alertname = labels.alertname ?? 'unknown_alert';
      const severity = labels.severity ?? 'unknown';
      const summary = annotations?.summary ?? 'No summary';
      const description = annotations?.description ?? 'No description';

      if (status === 'firing') {
        this.logger.error(
          `[ALERT:FIRING] ${alertname} (${severity}) on ${target} - ${summary} | ${description}`,
        );
      }

      if (status === 'resolved') {
        this.logger.warn(
          `[ALERT:RESOLVED] ${alertname} on ${target} - ${summary}`,
        );
      }
    });

    return;
  }
}
