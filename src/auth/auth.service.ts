import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    this.logger.debug(`username=${authCredentialsDto.username}`, 'signUp');
    const { username, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    this.logger.debug(`salt=${salt}`, 'signUp');
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.warn(`Existing username=${username}`, 'signUp');
        throw new ConflictException('Existing username');
      } else {
        this.logger.error('Internal server error', 'signUp');
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    this.logger.debug(`username=${authCredentialsDto.username}`, 'signIn');
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      this.logger.debug('login success', 'signIn');
      // create user token (Secret + Payload)
      const payload = { username };
      const accessToken = await this.jwtService.sign(payload);
      // console.log('accessToken:', accessToken);
      return { accessToken };
    } else {
      this.logger.warn(`login failed username=${username}`, 'signIn');
      throw new UnauthorizedException('login failed');
    }
  }
}
