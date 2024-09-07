import { Module } from '@nestjs/common';
import { UserChatRoomController } from './userchatroom.controller';
import { UserChatRoomsService } from './userchatrooms.service';

@Module({
  controllers: [UserChatRoomController],
  providers: [UserChatRoomsService],
})
export class UserChatRoomsModule {}
