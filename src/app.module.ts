import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './Modules/auth/auth.module';
import { GlobalModule } from './Modules/global/global.module';
import { UserModule } from './Modules/user/user.module';
import { ChatModule } from './Modules/chats/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // ScheduleModule.forRoot(),
    GlobalModule,
    AuthModule,
    UserModule,
    ChatModule
  ],
})
export class AppModule {}
