import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Book } from './books.entity';
import { Repository } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { CreateBookDto } from './dto/create-book.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('BOOK_REPOSITORY') private booksRepository: Repository<Book>,
  ) {}

  async create(username: string, bookData: CreateBookDto): Promise<void> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const book = { ...bookData, user };

    await this.booksRepository.save(book);
  }

  async findAll(
    username: string,
    query: PaginateQuery,
  ): Promise<Paginated<Book>> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const bookQuery = this.booksRepository
      .createQueryBuilder('book')
      .where('userUsername = :username', { username });

    return paginate(query, bookQuery, {
      sortableColumns: [
        'id',
        'title',
        'author',
        'summary',
        'total_page',
        'status',
        'created_at',
        'updated_at',
      ],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['title', 'author', 'summary'],
      select: [
        'id',
        'title',
        'author',
        'summary',
        'total_page',
        'status',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findOne(username: string, id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: {
        id,
        user: { username },
      },
    });
    if (!book) {
      throw new NotFoundException();
    }

    return book;
  }

  async update(
    username: string,
    bookId: number,
    bookData: UpdateBookDto,
  ): Promise<void> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const book = await this.booksRepository.findOne({
      where: {
        id: bookId,
        user: { username },
      },
    });

    if (!book) {
      throw new NotFoundException();
    }

    await this.booksRepository.save({ ...book, ...bookData });
  }

  async remove(username: string, id: number): Promise<void> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const result = await this.booksRepository.delete({
      id,
      user: { username },
    });

    if (result.affected < 1) {
      throw new NotFoundException();
    }
  }
}
