import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Chat } from './Chat';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];
}
