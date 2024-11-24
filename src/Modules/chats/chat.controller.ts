import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsAuthGuard } from 'src/guards/wsjwt.guard';
import {  messageRoomDto } from './dto/joinroom.dto';
import {
  messageRoomValidation,
} from './validations/chat.validations';
import { ChatService } from './chat.service';
import { WsThrottlerGuard } from 'src/guards/throttler.guard';

@WebSocketGateway()
export class ChatController {
  constructor(private readonly eventService: ChatService) {}

  @WebSocketServer()
  server: Server;

//   @UseGuards(WsAuthGuard)
//   @SubscribeMessage('joinchatroom')
//   async addedUser(
//     @MessageBody() roomdata: joinedRoomDto,
//     @ConnectedSocket() client: Socket,
//   ): Promise<void> {
//     const { error } = joinedRoomValidation(roomdata);
//     if (!error) {
//       const { data, error: serverErr } =
//         await this.eventService.adduserchatroom(roomdata);
//       if (data) {
//         client.join(data.chatroomid);
//         this.server.to(data.chatroomid).emit('joinedUser', data);
//       } else if (serverErr) {
//         throw new WsException(serverErr);
//       }
//     } else {
//       throw new WsException(error.message);
//     }
//   }

//   @SubscribeMessage('leavechatroom')
//   async leaveroom(
//     @MessageBody() roomdata: joinedRoomDto,
//     @ConnectedSocket() client: Socket,
//   ): Promise<void> {
//     const { error } = joinedRoomValidation(roomdata);
//     if (!error) {
//       const { data, error: serverErr } =
//         await this.eventService.removeuserchatroom(roomdata);
//       if (data) {
//         this.server.to(data.chatroomid).emit('leaveroom', data);
//         client.leave(data.chatroomid);
//       } else if (serverErr) {
//         throw new WsException(serverErr);
//       }
//     } else {
//       throw new WsException(error.message);
//     }
//   }

  @UseGuards(WsThrottlerGuard)
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() data: messageRoomDto): Promise<void> {
    const { error } = messageRoomValidation(data);
    if (!error) {
      const { userData } = await this.eventService.sendMessageRoom(data);
      if (userData) {
        this.server.to(userData[0].chatroomid).emit('message', userData); // room id has to be added
      } else {
        throw new WsException('Chat room not available');
      }
    } else {
      throw new WsException('Chatroom is not available');
    }
  }

//   @UseGuards(WsThrottlerGuard)
//   @UseGuards(WsAuthGuard)
//   @SubscribeMessage('sendFile')
//   async sendFile(@MessageBody() data: sendFileDto): Promise<void> {
//     const { userData } = await this.eventService.sendFileinRoom(data);
//     if (userData) {
//       this.server.to(userData.chatroomid).emit('message', userData);
//     } else {
//       throw new WsException('Error occured');
//     }
//   }
// }
}