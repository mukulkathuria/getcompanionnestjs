import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class AdminNotificationServices {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(AdminNotificationServices.name);

  async getAllNotifications() {
    try {
      const data = await this.prismaService.notification.findMany({
        where: { contentforadmin: { not: null } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      const values = data.map((l) => ({ ...l, expiry: String(l.expiry) }));
      return { data: values };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
