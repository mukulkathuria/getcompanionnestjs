import { Injectable, Logger } from '@nestjs/common';
import { Chat, Message } from 'src/dto/chat.dto'; // Replace with your entity definitions
import { errorDto } from 'src/dto/common.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);
  private readonly chats: Chat[] = []; // In-memory storage (replace with database)

  async getChatById(chatId: string): Promise<Chat | undefined> {
    try {
      const data = await this.prismaService.message.findMany({
        where: { chatroomid: chatId },
        include:{ User: true },
        orderBy: { createdAt: 'asc' },
      });
      // return { data }
    } catch (error) {
      this.logger.debug(error?.message || error);
      // return { error: { status: 500, message: 'Server error' } };
    }
    return this.chats.find((chat) => chat.id === chatId);
  }

  async addMessageToChat(chatId: string, message: Message): Promise<void> {
    try {
      const data = await this.prismaService.message.findMany({
        where: { chatroomid: chatId },
        include: { User: true },
        orderBy: { createdAt: 'asc' },
      });
      const AddMessageChat = await this.prismaService.message.create({
        data: {
          body: message.content,
          senderid: message.sender,
          chatroomid: chatId,
        },
      });
      const updatedMessges = [...data, AddMessageChat];
      console.log(updatedMessges);
    } catch (error) {
      console.log(error?.message || error);
      // return { error: { status: 500, message: 'Something went wrong' } };
    }
    const chat = await this.getChatById(chatId);
    if (chat) {
      chat.messages.push(message);
    }
  }

  // ... other chat-related methods
}
