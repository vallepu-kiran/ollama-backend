import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Chat } from "./entity/Chat";
import { Message } from "./entity/Message";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "kiran",
  password: "Kir@n8008",
  database: "ollama_db",
  entities: [User,Chat,Message],
  synchronize: true,
  logging: false,
});
