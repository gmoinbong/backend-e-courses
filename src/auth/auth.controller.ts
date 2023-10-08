import { RegistrationStatus } from './interfaces/registration-status.interface';
import { CreateUserDto } from 'src/users/dto/user.create.dto';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  HttpException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/user-login.dto';
import { LoginStatus } from './interfaces/login-status.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  public async register(
    @Body()
    createUserDto: CreateUserDto): Promise<RegistrationStatus> {
    const result: RegistrationStatus = await this.authService.register(
      createUserDto,
    );

    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto): Promise<LoginStatus> {
    return await this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard())
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}


