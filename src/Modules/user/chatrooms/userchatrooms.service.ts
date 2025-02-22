import { Injectable, Logger } from '@nestjs/common';
import { ChatRoomIdDto, ChatRoomReturnDto } from 'src/dto/chatrooms.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { addHours } from 'src/utils/common.utils';

@Injectable()
export class UserChatRoomsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserChatRoomsService.name);

  async getAllChatRooms(userId: string): Promise<ChatRoomReturnDto> {
    try {
      const data = await this.prismaService.chatRoom.findMany({
        where: {
          Bookings: {
            bookingend: { lt: addHours(1) },
            bookingstatus: 'ACCEPTED',
          },
          User: { some: { id: userId } },
        },
        select: {
          id: true,
          User: {
            select: {
              firstname: true,
              lastname: true,
              isCompanion: true,
              id: true,
              Images: true,
            },
          },
          Bookings: {
            select: {
              id: true,
              Sessions: { select: { id: true, isExtended: true } },
              bookingstart: true,
              bookingend: true,
            },
          },
        },
      });
      const values = data.map((l) => ({
        ...l,
        Bookings: {
          ...l.Bookings,
          bookingstart: String(l.Bookings.bookingstart),
          bookingend: String(l.Bookings.bookingend),
        },
      }));
      return { data: values };
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
