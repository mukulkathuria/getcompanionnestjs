import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './Modules/auth/auth.module';
import { GlobalModule } from './Modules/global/global.module';
import { UserModule } from './Modules/user/user.module';
import { ChatModule } from './Modules/chats/chat.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './Modules/admin/admin.module';
import { TaskModule } from './Modules/jobs/tasks.module';
import { CompanionModule } from './Modules/companion/companion.module';
import { join } from 'path';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 100,
        limit: 40,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath:
        process.env.NODE_ENV !== 'production'
          ? join(__dirname, '..', '..', 'Images')
        : join(__dirname, 'Images'),
      serveRoot: '/Images',
      serveStaticOptions: {
        index: false,
        fallthrough: false,
        extensions: ['jpg', 'jpeg', 'png', 'gif'],
      },
    }),
    GlobalModule,
    AuthModule,
    UserModule,
    AdminModule,
    ChatModule,
    CompanionModule,
    TaskModule,
  ],
})
export class AppModule {}
