import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UpdateUserDTO } from '@/auth/dto/update-user.dto';
import { UserData } from './users.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private usersRepository: Repository<User>,
  ) {}
  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async update(
    username: string,
    updateUserDTO: UpdateUserDTO,
  ): Promise<UserData> {
    if (
      updateUserDTO.password &&
      updateUserDTO.password !== updateUserDTO.password_confirm
    ) {
      throw new BadRequestException(['password not match']);
    }

    if (
      updateUserDTO.username &&
      (await this.findOne(updateUserDTO.username))
    ) {
      throw new BadRequestException(['username already exists']);
    }

    const user = await this.findOne(username);

    if (!user) {
      throw new Error('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_confirm: _, ...updateUserData } = updateUserDTO;

    if (updateUserData.password) {
      updateUserData.password = await bcrypt.hash(updateUserData.password, 10);
    }

    await this.usersRepository.update(
      { username },
      {
        ...user,
        ...updateUserData,
      },
    );

    let result: User;

    if (updateUserDTO.username) {
      result = await this.findOne(updateUserDTO.username);
    } else {
      result = await this.findOne(username);
    }

    return {
      name: result.name,
      username: result.username,
    };
  }
}
