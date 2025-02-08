import { Injectable, Logger } from '@nestjs/common';
import { ChatRoomIdDto, ChatRoomReturnDto } from 'src/dto/chatrooms.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserChatRoomsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserChatRoomsService.name);

  async getAllChatRooms(userId: string): Promise<ChatRoomReturnDto> {
    try {
      const data = await this.prismaService.chatRoom.findMany({
        where: {
          Bookings: {
            bookingstart: { gt: Date.now() },
            bookingstatus: 'ACCEPTED',
          },
          User: { some: { id: userId } },
        },
        select: {
          id: true,
          User: {
            select: { firstname: true, lastname: true, isCompanion: true, id: true },
          },
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getChatsFromChatid(chatId: ChatRoomIdDto) {
    try {
      const data = await this.prismaService.message.findMany({
        where: { chatroomid: chatId.chatroomid },
        select: {
          id: true,
          isHide: true,
          senderid: true,
          body: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
