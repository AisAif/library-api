import { Book } from '@/books/books.entity';
import { User } from '@/users/users.entity';
import { DataSource } from 'typeorm';

type CreateBookTest = {
  title: string;
  summary?: string;
  author: string;
  total_page: number;
  year: string;
  user: User;
};

export const createTestBook = async (
  book: CreateBookTest,
  dataSource: DataSource,
): Promise<Book> => {
  return dataSource.getRepository(Book).save({
    title: book.title,
    summary: book.summary,
    author: book.author,
    total_page: book.total_page,
    year: book.year,
    user: book.user,
  });
};
