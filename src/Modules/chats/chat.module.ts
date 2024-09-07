import { Module } from '@nestjs/common';
import { ChatGateway } from './Socketconfig/socket.gateway';

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}