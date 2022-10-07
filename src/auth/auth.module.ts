import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from './user.entity';
import * as config from 'config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || config.get('jwt').secret,
      signOptions: {
        expiresIn: config.get('jwt').expiresIn, // 1 hour
      },
    }),
    // JwtModule.registerAsync({
    // 	imports: [ConfigModule],
    // 	useFactory: async (configService: ConfigService) => ({
    // 		secret: config.get('jwt').secret,
    // 		signOptions: {
    // 			expiresIn: config.get('jwt').expiresIn, // 1 hour
    // 		}
    // 	}),
    // 	inject: [ConfigService],
    // }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
