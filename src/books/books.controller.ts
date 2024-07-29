import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @HttpCode(201)
  async create(@Req() req, @Body() book: CreateBookDto) {
    try {
      await this.booksService.create(req.user.username, book);
    } catch (error) {
      throw error;
    }
  }
}
