import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
