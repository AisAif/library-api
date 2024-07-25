import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import usersRepository from './users.repository';
import { DatabaseModule } from '@/database/database.module';

@Module({
  providers: [UsersService, usersRepository()],
  exports: [UsersService],
  imports: [DatabaseModule],
})
export class UsersModule {}
