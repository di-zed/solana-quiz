import { Histogram, register } from 'prom-client';

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route'],
  buckets: [0.3, 0.5, 1, 1.5, 2, 3, 5, 10],
});

register.registerMetric(httpRequestDurationSeconds);
