import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class AdminAccountsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(AdminAccountsService.name);

  async getAccountStatement() {
    try {
      const data = await this.prismaService.transactions.findMany({
        where: { status: { in: ['COMPLETED', 'REFUNDED'] } },
        select: {
          User: {
            select: {
              firstname: true,
              gender: true,
              email: true,
              phoneno: true,
            },
          },
          txnid: true,
          transactionTime: true,
          payurefid: true,
          status: true,
          paymentdetails: true,
          amount: true,
          Bookings: {
            select: {
              bookingrate: true,
              finalRate: true,
              extendedhours: true,
              extentedfinalrate: true,
            },
          },
        },
      });
      const values = data.map((l) => ({
        ...l,
        transactionTime: String(l.transactionTime),
        User: { ...l.User, phoneno: String(l.User.phoneno) },
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }
}
