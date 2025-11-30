/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import expressRuid from 'express-ruid';
import helmet from 'helmet';
import hpp from 'hpp';
import i18n from 'i18n';
import morgan from 'morgan';
import path from 'path';
import Cron from './cron/cron';
import Kafka from './kafka/kafka';
import Routes from './routes';

/**
 * Bootstrap Class.
 */
class Bootstrap {
  /**
   * Bootstrap Constructor.
   *
   * @param app
   */
  public constructor(app: Application) {
    this.setConfig(app);

    console.log('Server Configured!');

    new Routes(app);

    new Cron().run();
    new Kafka().run();
  }

  /**
   * Set Configurations.
   *
   * @param app
   * @returns void
   * @protected
   */
  protected setConfig(app: Application): void {
    // Serving static files.
    app.use(express.static(path.join(__dirname, 'public')));

    // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
    app.use(cookieParser());

    if (process.env.FRONT_PUBLIC_URL) {
      app.use(
        cors({
          origin: process.env.FRONT_PUBLIC_URL,
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          credentials: true,
        }),
      );
    }

    // Lightweight simple translation module with dynamic JSON storage.
    i18n.configure({
      locales: ['ru'],
      defaultLocale: 'ru',
      directory: path.join(__dirname, 'locales'),
    });
    app.use(i18n.init);

    // Set view engine.
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Generates UUID for request and add it to header.
    app.use(
      expressRuid({
        setInContext: true,
        header: 'X-Request-Id',
        attribute: 'requestId',
      }),
    );

    // Helmet helps secure Express apps by setting HTTP response headers.
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            scriptSrc: ["'self'", process.env.FRONT_PUBLIC_URL ?? '', 'cdn.jsdelivr.net'],
            connectSrc: ["'self'", process.env.FRONT_PUBLIC_URL ?? ''],
            'form-action': null,
          },
        },
      }),
    );

    // HTTP request logger middleware for Node.js.
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    // It parses incoming requests with JSON payloads and is based on body-parser.
    app.use(express.json({ limit: '10kb' }));

    // It parses incoming requests with URL-encoded payloads and is based on a body parser.
    app.use(
      express.urlencoded({
        extended: true,
        limit: '10kb',
      }),
    );

    // Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and URL params.
    require('xss-clean')();

    // Express middleware to protect against HTTP Parameter Pollution attacks.
    app.use(hpp());
  }
}

export default function (app: Application): Bootstrap {
  return new Bootstrap(app);
}
