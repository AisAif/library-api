import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private usersRepository: Repository<User>,
  ) {}
  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
  async findOne(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }
}
