import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chats)
  user: User;

  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
