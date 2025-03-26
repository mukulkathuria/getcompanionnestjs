import { Injectable, Logger } from '@nestjs/common';
import { OTPData } from 'src/Cache/OTP';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class DevelopmentService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(DevelopmentService.name);

  async getOTPList() {
    return OTPData.data;
  }
}
