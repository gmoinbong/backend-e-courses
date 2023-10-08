import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './../users/dto/user-login.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../users/users.service';
import { CreateUserDto } from 'src/users/dto/user.create.dto';
import { RegistrationStatus } from './interfaces/registration-status.interface';
import { LoginStatus } from './interfaces/login-status.interface';
import { UserDto } from 'src/users/dto/user.dto';
import { JwtPayload } from './interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    }
    try {
      await this.usersService.create(userDto);
    } catch (error) {
      status = {
        success: false,
        message: error,
      }
    }
    return status
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginStatus> {
    const user = await this.usersService.findByLogin(loginUserDto)

    const token = this._createToken(user)

    return {
      username: user.username,
      ...token,
    }
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken({ username }: UserDto): any {
    const expiresIn = this.configService.getOrThrow<string>('EXPIRESIN');

    const user: JwtPayload = { username };
    const accessToken = this.jwtService.sign(user)
    return {
      expiresIn,
      accessToken,
    };
  }
}
