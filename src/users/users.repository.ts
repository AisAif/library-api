import { DataSource } from 'typeorm';
import { User } from './users.entity';
import { Provider } from '@nestjs/common';

export default (): Provider => ({
  provide: 'USER_REPOSITORY',
  useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
  inject: ['DATA_SOURCE'],
});
