import { Book } from '@/books/books.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryColumn()
  username: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @OneToMany(() => Book, (book) => book.user)
  books?: Book[];
}
