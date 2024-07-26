import { User, UserRole } from '@/users/users.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export const createTestUser = async (dataSource: DataSource): Promise<User> => {
  return await dataSource.getRepository(User).save({
    name: 'test',
    username: 'test',
    password: await bcrypt.hash('testtest', 10),
    role: UserRole.USER,
  });
};
