import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggingService implements LoggingService {
  logger: Logger;

  constructor() {
    // infoログ（通常ログ）の出力先を定義
    const applicationLogTransport: DailyRotateFile = new DailyRotateFile({
      level: 'debug',
      filename: 'application-%DATE%.log',
      dirname: 'logs/application',
      datePattern: 'YYYYMMDD',
      maxFiles: '7d',
    });

    // errorログの出力先を定義
    const errorLogTransport: DailyRotateFile = new DailyRotateFile({
      level: 'error',
      filename: 'error-%DATE%.log',
      dirname: 'logs/error',
      datePattern: 'YYYYMMDD',
      maxFiles: '7d',
    });

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
				format.errors({ stack: true }), 
        format.printf(
          (info) =>
					`${info.timestamp} ${info.level} ${info.message}${info.err}[${info.service}:${info.funcName}]`,
        ),
      ),
      defaultMeta: { err: '', service: '', funcName: '' }, // デフォルトの出力項目を指定
      transports: [applicationLogTransport, errorLogTransport],
    });

    // envでログをコンソール出力するか決定する
    // コンソールへの出力を追加しないと開発がしづらいので注意
    if (process.env.ENV_NAME === 'development') {
      this.logger.add(
        new transports.Console({
          level: 'debug',
          // format: format.combine(format.colorize(), format.simple()),
          format: format.combine(
            format.colorize(),
						format.printf(
							(info) =>
							`${info.timestamp} ${info.level} ${info.message}${info.err}[${info.service}:${info.funcName}]`,
						),
          ),
        }),
      );
    }
  }

  // デフォルトのLoggerServiceを継承しているため、log・error・warnは実装しないといけない
  log(message: string, funcName: string, service: string): void {
    this.logger.log(message, { funcName, service });
  }

  error(message: string, err: Error, funcName: string, service: string): void {
    this.logger.error(message, err, { funcName, service });
  }

  warn(message: string, funcName: string, service: string): void {
    this.logger.warn(message, { funcName, service });
  }

  debug(message: string, funcName: string, service: string): void {
    this.logger.debug(message, { funcName, service });
  }
}
