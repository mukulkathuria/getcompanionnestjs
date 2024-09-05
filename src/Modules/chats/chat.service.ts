import { Injectable } from '@nestjs/common';
import { Chat, Message } from 'src/dto/chat.dto'; // Replace with your entity definitions

@Injectable()
export class ChatService {
  private readonly chats: Chat[] = []; // In-memory storage (replace with database)

  async getChatById(chatId: string): Promise<Chat | undefined> {
    return this.chats.find((chat) => chat.id === chatId);
  }

  async addMessageToChat(chatId: string, message: Message): Promise<void> {
    const chat = await this.getChatById(chatId);
    if (chat) {
      chat.messages.push(message);
    }
  }

  // ... other chat-related methods
}