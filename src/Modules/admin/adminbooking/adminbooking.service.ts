import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import { timeAgo } from 'src/utils/formatDate.utils';

@Injectable()
export class AdminBookingService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async getAllAdminBookings() {
    try {
      const data = await this.prismaService.booking.findMany({
        where: {
          bookingstatus: 'UNDERREVIEW',
          bookingend: { gte: Date.now() },
        },
        select: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              gender: true,
              isCompanion: true,
            },
          },
          Meetinglocation: { select: { city: true } },
          bookingstart: true,
          id: true,
        },
      });
      const filtereddata = data.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
      }));
      return { data: filtereddata };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getBookingDetails(bookingId: number) {
    try {
      if (!bookingId || typeof bookingId !== 'number') {
        return { error: { status: 422, message: 'Booking id is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
        select: {
          Meetinglocation: {
            select: {
              lat: true,
              lng: true,
              city: true,
              googleformattedadress: true,
              googleloc: true,
            },
          },
          User: {
            select: {
              firstname: true,
              lastname: true,
              age: true,
              Images: true,
              gender: true,
              isCompanion: true,
            },
          },
          cancellationDetails: {
            select: {
              firstname: true,
              lastname: true,
              age: true,
              Images: true,
              gender: true,
              isCompanion: true,
            },
          },
          bookingstart: true,
          bookingrate: true,
          bookingend: true,
          bookingduration: true,
          bookingpurpose: true,
          finalRate: true,
          bookingstatus: true,
          cancelledReason: true,
          Transactions: {
            select: {
              status: true,
              amount: true,
              txnid: true,
              transactionTime: true,
            },
          },
          rating: {
            select: {
              rater: { select: { firstname: true, isCompanion: true } },
              ratee: { select: { firstname: true, isCompanion: true } },
            },
          },
        },
      });
      if (!data) {
        return { error: { status: 404, message: 'Booking id not found' } };
      }
      const values = {
        ...data,
        bookingstart: String(data.bookingstart),
        bookingend: String(data.bookingend),
        Transactions: data.Transactions.map((l) => ({
          ...l,
          transactionTime: String(l.transactionTime),
        })),
      };
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getBookingList() {
    try {
      const data = await this.prismaService.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          User: {
            select: { Images: true, firstname: true, isCompanion: true },
          },
          Meetinglocation: { select: { googleloc: true, city: true } },
          bookingpurpose: true,
          bookingstart: true,
          bookingstatus: true,
          id: true,
        },
      });
      const values = data.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getCancellationRequest() {
    try {
      const data = await this.prismaService.booking.findMany({
        where: { bookingstatus: 'UNDERCANCELLATION' },
        select: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              isCompanion: true,
              gender: true,
            },
          },
          bookingstart: true,
          id: true,
        },
      });
      const values = data.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getCancellationRequesListofUser() {
    try {
      const data = await this.prismaService.booking.findMany({
        where: {
          bookingstatus: 'CANCELLEDREFUNDPENDING',
          Transactions: { none: { status: 'REFUNDED' } },
        },
        select: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              isCompanion: true,
              gender: true,
            },
          },
          Meetinglocation: { select: { googleloc: true, city: true } },
          bookingstart: true,
          id: true,
        },
      });
      const values = data.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getExtensionRequest() {
    try {
      const data = await this.prismaService.booking.findMany({
        where: { bookingstatus: 'UNDEREXTENSION' },
        select: {
          User: {
            select: {
              firstname: true,
              lastname: true,
              isCompanion: true,
              gender: true,
            },
          },
          Meetinglocation: { select: { googleloc: true, city: true } },
          bookingstart: true,
          updatedAt: true,
          id: true,
        },
      });
      const values = data.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
        updatedAt: timeAgo(l.updatedAt.toISOString())
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
