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
}
