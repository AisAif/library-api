import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import booksRepository from './books.repository';
import { DatabaseModule } from '@/database/database.module';
import { UsersModule } from '@/users/users.module';

@Module({
  providers: [BooksService, booksRepository()],
  controllers: [BooksController],
  imports: [DatabaseModule, UsersModule],
})
export class BooksModule {}
