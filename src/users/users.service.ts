import { Controller, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/user.create.dto';
import { toUserDto } from 'src/shared/mapper';
import { LoginUserDto } from './dto/user-login.dto';
import { comparePasswords } from 'src/shared/utils';

@Injectable()
@Controller('users')
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) { }

  async create(userDto: CreateUserDto): Promise<UserDto> {
    const { username, password, email } = userDto;

    const userInDb = await this.usersRepository.findOne({ where: { username } });
    if (userInDb) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)
    }
    const user: UserEntity = await this.usersRepository.create({
      email,
      username,
      password,
    })

    await this.usersRepository.save(user)

    return toUserDto(user)
  }


  async findOne(options?: object): Promise<UserDto> {
    const user = await this.usersRepository.findOne(options);
    return toUserDto(user);
  }

  async findByLogin({ username, password }: LoginUserDto): Promise<UserDto> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED)
    }

    const areEqual = await comparePasswords(user.password, password)

    if (!areEqual) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    }

    return toUserDto(user);
  }

  async findByPayload({ username }: { username: string }): Promise<UserDto> {
    return await this.findOne({ where: { username } })
  }

  private _sanitizeUser(user: UserEntity) {
    delete user.password;
    return user;
  }
}
