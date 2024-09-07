import {
  Body,
  Controller,
  Get,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { UserChatRoomRoute } from '../routes/user.routes';
import {
  ChatRoomIdDto,
  ChatRoomReturnDto,
  UserChatMessagesReturnDto,
} from 'src/dto/chatrooms.dto';
import { UserChatRoomsService } from './userchatrooms.service';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserProfileParamsDto } from 'src/dto/user.dto';

@Controller(UserChatRoomRoute)
export class UserChatRoomController {
  constructor(private readonly companionfindservice: UserChatRoomsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserChatRoomController(
    @Body() user: UserProfileParamsDto,
  ): Promise<ChatRoomReturnDto> {
    const { data, error } =
      await this.companionfindservice.getAllChatRooms(user);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get('getchatmessages')
  async getUserChatMessageController(
    @Body() chatroomid: ChatRoomIdDto,
  ): Promise<UserChatMessagesReturnDto> {
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
