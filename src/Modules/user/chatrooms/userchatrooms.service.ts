import { Injectable, Logger } from '@nestjs/common';
import { ChatRoomIdDto, ChatRoomReturnDto } from 'src/dto/chatrooms.dto';
import { UserProfileParamsDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class UserChatRoomsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserChatRoomsService.name);

  async getAllChatRooms(userId: UserProfileParamsDto ): Promise<ChatRoomReturnDto> {
    try {
      const data = await this.prismaService.user.findMany({
        where: { id: userId.id },
        include: {
          Booking: {
            where: {
              bookingstart: { gt: new Date().getTime() },
              bookingstatus: 'ACCEPTED',
            },
          },
          Chats: true,
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
        include:{ User: true },
        orderBy: { createdAt: 'asc' },
      });
      return { data }
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
