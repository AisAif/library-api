import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserData } from '@/users/users.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(user: RegisterDto) {
    if (user.password !== user.password_confirm) {
      throw new BadRequestException(['password not match']);
    }

    const result = await this.usersService.findOne(user.username);
    if (result) {
      throw new BadRequestException(['username already exists']);
    }

    user.password = await bcrypt.hash(user.password, 10);

    await this.usersService.save({
      name: user.name,
      username: user.username,
      password: user.password,
    });
  }

  async validateUser(loginDto: LoginDto): Promise<UserData | null> {
    const user = await this.usersService.findOne(loginDto.username);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      return null;
    }

    return {
      name: user.name,
      username: user.username,
    };
  }

  login(user: UserData): string {
    const payload = {
      username: user.username,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }
}
