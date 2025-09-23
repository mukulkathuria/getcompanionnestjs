import {
  Body,
  Controller,
  Get,
  HttpException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatRoomInnerRoutes, UserChatRoomRoute } from '../routes/user.routes';
import {
  ChatRoomIdDto,
  ChatRoomReturnDto,
  UserChatMessagesReturnDto,
} from 'src/dto/chatrooms.dto';
import { UserChatRoomsService } from './userchatrooms.service';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserProfileParamsDto } from 'src/dto/user.dto';
import { ApiControllerTag } from 'src/swagger/decorators';


@ApiControllerTag('user-userchatroom')
@Controller(UserChatRoomRoute)
export class UserChatRoomController {
  constructor(private readonly companionfindservice: UserChatRoomsService) {}

  @UseGuards(AuthGuard)
  @Get(ChatRoomInnerRoutes.getAllChatRoomRoute)
  async getUserChatRoomController(
    @Req() req: Request,
  ): Promise<ChatRoomReturnDto> {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: TokenData } = decodeExpressRequest(req);
    if (TokenData) {
      const { data, error } = await this.companionfindservice.getAllChatRooms(
        TokenData.userId,
      );
      if (data) {
        return {
          data,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException('Server Error', 403);
    }
  }

  @UseGuards(AuthGuard)
  @Get(ChatRoomInnerRoutes.getChatMessageHistoryRoute)
  async getUserChatMessageController(
    @Body() chatroomid: ChatRoomIdDto,
  ) {
    const { data, error } =
      await this.companionfindservice.getChatsFromChatid(chatroomid);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
