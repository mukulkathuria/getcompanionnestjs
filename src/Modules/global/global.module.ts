import { Global, Module } from '@nestjs/common';
import { NodeMailerService } from 'src/Services/nodemailer.service';
import { PrismaService } from 'src/Services/prisma.service';

@Global()
@Module({
  providers: [PrismaService, NodeMailerService],
  exports: [PrismaService, NodeMailerService],
})
export class GlobalModule {}
