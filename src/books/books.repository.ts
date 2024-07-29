import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { Book } from './books.entity';

export default (): Provider => ({
  provide: 'BOOK_REPOSITORY',
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Book),
  inject: ['DATA_SOURCE'],
});
