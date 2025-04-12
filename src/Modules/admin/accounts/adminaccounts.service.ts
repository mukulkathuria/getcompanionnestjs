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
          paymentmethod: true,
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
        username: l.User.firstname,
        useremail: l.User.email,
        gender: l.User.gender,
        userphoneno: String(l.User.phoneno),
        amount: String(l.amount),
        txid: l.txnid,
        status: l.status,
        paymentmethod: l.paymentmethod,
        paymentdetails: l.paymentdetails,
        GST: l.Bookings.finalRate * 0.18,
        bookingrate: l.Bookings.bookingrate,
        bookingfinalrate: l.Bookings.finalRate,
        bookingextendedhours: l.Bookings.extendedhours,
        bookingextendedrate: l.Bookings.extentedfinalrate,
        transactionTime: String(l.transactionTime),
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }
}
