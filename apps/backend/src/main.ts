/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // localhost限定のCORS設定
  app.enableCors({
    origin: (origin, callback) => {
      // originがundefinedの場合（同一オリジン）は許可
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // localhost, 127.0.0.1, [::1]のみ許可
      const allowedPatterns = [
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^http:\/\/\[::1\](:\d+)?$/,
      ];
      
      const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Only localhost access is allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
