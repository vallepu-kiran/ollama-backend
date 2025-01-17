import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import cors from 'cors';
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Chat } from "./entity/Chat";
import { Message } from "./entity/Message";

const app = express();
app.use(express.json());
app.use(cors());

AppDataSource.initialize()
  .then(async () => {
    console.log("Connected to the database");


    app.get("/users", async (req: Request, res: Response) => {
      try {
        const users = await AppDataSource.getRepository(User).find();
        res.json(users);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error fetching users", error });
      }
    });
    // Fetch a specific user by ID
    app.get("/users/:id", async (req: Request, res: Response) => {
      const userId = parseInt(req.params.id, 10);

      try {
        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error fetching user", error });
      }
    });



    app.post("/users", [
      body('firstName').isString().notEmpty(),
      body('lastName').isString().notEmpty(),
      body('age').isInt({ min: 0 })
    ], async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { firstName, lastName, age } = req.body;
        const user = AppDataSource.getRepository(User).create({ firstName, lastName, age });
        await AppDataSource.getRepository(User).save(user);
        res.status(201).json(user);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error creating user", error });
      }
    });


    app.delete("/users/:id", async (req: Request, res: Response) => {
      const userId = parseInt(req.params.id, 10);

      try {
        const result = await AppDataSource.getRepository(User).delete(userId);
        if (result.affected === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(204).send();
      } catch (error: unknown) {
        res.status(500).json({ message: "Error deleting user", error });
      }
    });



    app.get("/users/:userId/chats/:chatId/messages", async (req: Request, res: Response) => {
      const { userId, chatId } = req.params;

      try {
        const chat = await AppDataSource.getRepository(Chat).findOne({
          where: { id: parseInt(chatId, 10), user: { id: parseInt(userId, 10) } },
          relations: ["messages"],
        });

        if (!chat) {
          return res.status(404).json({ message: "Chat or User not found" });
        }

        res.json(chat.messages);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error fetching messages", error });
      }
    });


    app.post("/users/:userId/chats/:chatId/messages", [
      body('question').isString().notEmpty(),
      body('answer').isString().notEmpty(),
    ], async (req: Request, res: Response) => {
      const { userId, chatId } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const chat = await AppDataSource.getRepository(Chat).findOne({
          where: { id: parseInt(chatId, 10), user: { id: parseInt(userId, 10) } },
        });

        if (!chat) {
          return res.status(404).json({ message: "Chat or User not found" });
        }

        const { question, answer } = req.body;
        const message = AppDataSource.getRepository(Message).create({
          question,
          answer,
          chat,
        });

        await AppDataSource.getRepository(Message).save(message);
        res.status(201).json(message);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error creating message", error });
      }
    });


    app.delete("/users/:userId/chats/:chatId/messages/:messageId", async (req: Request, res: Response) => {
      const { userId, chatId, messageId } = req.params;

      try {
        const result = await AppDataSource.getRepository(Message).delete({
          id: parseInt(messageId, 10),
          chat: { id: parseInt(chatId, 10), user: { id: parseInt(userId, 10) } },
        });

        if (result.affected === 0) {
          return res.status(404).json({ message: "Message not found for this user's chat" });
        }

        res.status(204).send();
      } catch (error: unknown) {
        res.status(500).json({ message: "Error deleting message", error });
      }
    });

    app.post("/users/:userId/chats", [
      body('title').isString().notEmpty(),
    ], async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId, 10);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {

        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }


        const { title } = req.body;
        const chat = AppDataSource.getRepository(Chat).create({
          title,
          created_at: new Date(),
          user,
        });

        await AppDataSource.getRepository(Chat).save(chat);
        res.status(201).json(chat);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error creating chat", error });
      }
    });

    app.get("/users/:userId/chats", async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId, 10);

      try {

        const chats = await AppDataSource.getRepository(Chat).find({
          where: { user: { id: userId } },
        });

        if (chats.length === 0) {
          return res.status(404).json({ message: "No chats found for this user" });
        }

        res.json({ data: chats, meta: { total: chats.length } });
      } catch (error: unknown) {
        res.status(500).json({ message: "Error fetching chats", error });
      }
    });

    app.get("/users/:userId/chats/:chatId", async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId, 10);
      const chatId = parseInt(req.params.chatId, 10);

      try {

        const chat = await AppDataSource.getRepository(Chat).findOne({
          where: { id: chatId, user: { id: userId } },
          relations: ["messages"],
        });

        if (!chat) {
          return res.status(404).json({ message: "Chat or User not found" });
        }

        res.json(chat);
      } catch (error: unknown) {
        res.status(500).json({ message: "Error fetching chat", error });
      }
    });



    app.delete("/users/:userId/chats/:chatId", async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId, 10);
      const chatId = parseInt(req.params.chatId, 10);

      try {

        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const chat = await AppDataSource.getRepository(Chat).findOne({
          where: { id: chatId, user: { id: userId } },
          relations: ["messages"],
        });

        if (!chat) {
          return res.status(404).json({ message: "Chat not found for this user" });
        }


        await AppDataSource.getRepository(Message).delete({ chat: { id: chatId } });

       
        await AppDataSource.getRepository(Chat).delete(chatId);

        res.status(204).send();
      } catch (error: unknown) {
        res.status(500).json({ message: "Error deleting chat", error });
      }
    });





    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!', error: err.message });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
