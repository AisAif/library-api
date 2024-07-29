import { User } from '@/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum BookStatus {
  READ = 'read',
  IN_READING = 'in_reading',
  UNREAD = 'unread',
}

@Entity({
  name: 'books',
})
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.UNREAD,
  })
  status?: BookStatus;

  @Column({
    nullable: true,
  })
  summary?: string;

  @Column()
  total_page: number;

  @Column()
  year: string;

  @ManyToOne(() => User, (user) => user.books)
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
