import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
import { UsersService } from 'src/Modules/user/users/users.service';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({ serveClientSid: true, cors: { origin: '*' } }) // Enable client ID access
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UsersService,
  ) {}

  @WebSocketServer() server: Server;

  connectedClients: Record<string, string> = {}; // Map user ID to chat ID

  @UseGuards(AuthGuard)
  @SubscribeMessage('joinChat')
  async handleJoinChat(@MessageBody() chatId: string, socket: Socket) {
    // const user = this.userService.getUserById(socket.client.id); // Replace with your auth logic
    const user = { id: 'and' };
    if (!user) {
      throw new WsException('Unauthorized');
    }

    const chat = await this.chatService.getChatById(chatId);
    if (!chat) {
      throw new WsException('Chat not found');
    }

    if (!chat.participants.includes(user.id)) {
      throw new WsException('User not authorized for this chat');
    }

    this.connectedClients[user.id] = chatId;
    socket.join(chatId);

    const messages = await this.chatService.getChatById(chatId);
    socket.emit('chatHistory', messages);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { sender: string; recipient: string; message: string },
  ) {
    // Handle the incoming message, e.g., broadcast it to the recipient
    console.log('Received message:', data);
    // ...
  }
}
