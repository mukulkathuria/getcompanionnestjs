import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class AdminAccountsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(AdminAccountsService.name);

  async getAccountStatement() {
    try {
      const data = await this.prismaService.transactionLedger.findMany({
        where: { transactionType: { in: ['ADMIN_COMMISSION'] } },
        select: {      
          txnId: true,
          paymentGatewayTxnId: true,
          status: true,
          paymentMethod: true,
          metadata: true,
          netAmount: true,
          taxAmount: true,
          settledAt: true,
          FromUser:{
            select: {
              firstname: true,
              email: true,
              phoneno: true,
              gender: true,
            },
          },
          Booking: {
            select: {
              bookingrate: true,
              finalRate: true,
            },
          },
        },
      });
      const values = data.map((l) => ({
        username: l.FromUser.firstname,
        useremail: l.FromUser.email,
        gender: l.FromUser.gender,
        userphoneno: String(l.FromUser.phoneno),
        amount: String(l.netAmount),
        txid: l.txnId,
        status: l.status,
        paymentmethod: l.paymentMethod,
        paymentdetails: l.metadata,
        GST: l.Booking.finalRate * 0.18,
        bookingrate: l.Booking.bookingrate,
        bookingfinalrate: l.Booking.finalRate,
        transactionTime: String(l.settledAt),
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }
}
