import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

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

  @Get()
  @HttpCode(200)
  async findAll(@Req() req, @Paginate() query: PaginateQuery) {
    return this.booksService.findAll(req.user.username, query);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    try {
      return this.booksService.findOne(req.user.username, id);
    } catch (error) {
      throw error;
    }
  }
}