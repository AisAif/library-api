import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(user: RegisterDto) {
    if (user.password !== user.password_confirm) {
      throw new BadRequestException('password not match');
    }

    const result = await this.usersService.findOne(user.username);
    if (result) {
      throw new BadRequestException('username already exists');
    }

    user.password = await bcrypt.hash(user.password, 10);

    await this.usersService.save({
      name: user.name,
      username: user.username,
      password: user.password,
    });
  }
}
