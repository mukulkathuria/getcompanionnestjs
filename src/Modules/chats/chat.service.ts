import { Injectable, Logger } from '@nestjs/common';
import {
  // ImageMimeType,
  // joinedRoomDto,
  messageRoomDto,
  // sendFileDto,
} from './dto/joinroom.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  // async adduserchatroom(roomuser: joinedRoomDto) {
  //   const { username, roomid } = roomuser;
  //   try {

  //     return { data };
  //   } catch (error) {
  //     return { error: { status: 500, message: 'Server error' } };
  //   }
  // }

  // async removeuserchatroom(roomuser: joinedRoomDto) {
  //   const { username, roomid } = roomuser;
  //   try {
  //     const data = await this.chatModel
  //       .findOneAndUpdate(
  //         {
  //           chatroomid: roomid,
  //           'users.username': username,
  //         },
  //         {
  //           $set: {
  //             'users.$.isOnline': false,
  //             'users.$.lastOffline': new Date(),
  //           },
  //         },
  //         { new: true },
  //       )
  //       .select('chatroomid users createdBy messages');
  //     return { data };
  //   } catch (error) {
  //     return { error: { status: 500, message: 'Server error' } };
  //   }
  // }

  async sendMessageRoom(roomuser: messageRoomDto) {
    const { roomid, message } = roomuser;
    try {
      const data = await this.prismaService.message.findMany({
        where: { chatroomid: roomid },
        include: { User: true },
        orderBy: { createdAt: 'asc' },
      });
      const AddMessageChat = await this.prismaService.message.create({
        data: {
          body: message.content,
          senderid: message.sender,
          chatroomid: roomid,
        },
      });
      const updatedMessges = [...data, AddMessageChat];
      console.log(updatedMessges);
      return { userData: updatedMessges };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  // async sendFileinRoom(roomdata: sendFileDto) {
  //   const { error } = fileSendValidation(roomdata);
  //   if (error) {
  //     return { error };
  //   }
  //   const { mimeType, file, roomid, username } = roomdata;
  //   const ext = Object.keys(ImageMimeType).find(
  //     (l) => ImageMimeType[l] === mimeType,
  //   );
  //   const path = 'messages/' + Date.now() + '.' + ext;
  //   const buffer = Buffer.from(file).toString('base64');
  //   try {
  //     await writeFile('./' + path, buffer, { encoding: 'base64' }, (err) => {
  //       if (err) {
  //         throw new Error('File error');
  //       }
  //     });
  //     const user = await this.chatModel
  //       .findOneAndUpdate(
  //         { chatroomid: roomid },
  //         {
  //           $push: {
  //             messages: {
  //               senderUsername: username,
  //               filePath: path,
  //               isFile: true,
  //               message: '',
  //               mimeType,
  //             },
  //           },
  //           $set: {
  //             lastMessage: { sender: username, message: 'Sent a photo 📷️' },
  //           },
  //         },
  //         { new: true },
  //       )
  //       .select('chatroomid users createdBy messages');
  //     const { isBothOnline, receiver } = checkUserMessages(user, username);
  //     if (!isBothOnline) {
  //       await this.userModel.findOneAndUpdate(
  //         { username: receiver, 'Chats.chatroomid': roomid },
  //         {
  //           $inc: { 'Chats.$.unseenMessages': 1 },
  //         },
  //       );
  //     }
  //     return { userData: user };
  //   } catch (error) {
  //     return { error: { status: 500, message: 'Server issue' } };
  //   }
  // }
}
