import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'ormconfig';
import { LoggingModule } from './logging/logging.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(AppDataSource.options),
    LoggingModule,
    BoardsModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}
