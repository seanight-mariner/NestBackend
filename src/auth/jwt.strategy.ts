import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
			// check authority
      secretOrKey: process.env.JWT_SECRET || config.get('jwt').secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    this.logger.debug('', 'validate');
    const { username } = payload;
    const user: User = await this.userRepository.findOneBy({ username });

    if (!user) {
      this.logger.warn(`Not found username=${username}`, 'signIn');
      throw new UnauthorizedException();
    }

		return user;
  }
}
