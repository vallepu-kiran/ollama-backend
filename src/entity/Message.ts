import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Chat } from './Chat';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @Column()
  question: string;

  @Column()
  answer: string;
}
