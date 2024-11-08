import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './Modules/auth/auth.module';
import { GlobalModule } from './Modules/global/global.module';
import { UserModule } from './Modules/user/user.module';
import { ChatModule } from './Modules/chats/chat.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './Modules/admin/admin.module';
import { TaskModule } from './Modules/jobs/tasks.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 100,
      limit: 80,
    }]),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    GlobalModule,
    AuthModule,
    UserModule,
    AdminModule,
    ChatModule,
    TaskModule
  ],
})
export class AppModule {}
