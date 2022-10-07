import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';
import * as config from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(LoggingService));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        console.error('ValidationPipe:', JSON.stringify(validationErrors));
        return new BadRequestException(validationErrors);
      },
      transform: true,
    }),
  );
  const port = process.env.API_PORT || config.get('server').port;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
