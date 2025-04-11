import { Injectable, Logger } from '@nestjs/common';
import {
  pageNoQueryDto,
  updateBookingStatusInputDto,
} from 'src/dto/bookings.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { timeAgo } from 'src/utils/formatDate.utils';
import { validateBookingStatusInput } from 'src/validations/booking.validation';

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

  async getBookingList(params: pageNoQueryDto) {
    try {
      const pageNo = Number(params.pageNo) || 1;
      const limit = 10;
      const [items, aggregateResult] = await this.prismaService.$transaction([
        this.prismaService.booking.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (pageNo - 1) * limit,
          take: limit,
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
        }),
        this.prismaService.booking.aggregate({
          _count: {
            id: true,
          },
        }),
      ]);
      const totalCount = aggregateResult._count.id;
      const totalPages = Math.ceil(totalCount / limit);
      const values = items.map((l) => ({
        ...l,
        bookingstart: String(l.bookingstart),
      }));
      const finalvalue = {
        totalPages,
        limit,
        currentPage: pageNo,
        bookings: values,
      };
      return { data: finalvalue };
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
        updatedAt: timeAgo(l.updatedAt.toISOString()),
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async updateBookingStatus(input: updateBookingStatusInputDto) {
    try {
      const { error } = validateBookingStatusInput(input);
      if (error) {
        return { error };
      }
      await this.prismaService.booking.update({
        where: { id: input.bookingid },
        data: {
          bookingstatus: input.status,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getPendingRefundBookingList() {
    try {
      const data = await this.prismaService.booking.findMany({
        where: {
          OR: [
            {
              bookingstatus: {
                in: [
                  'CANCELLEDREFUNDPENDING',
                  'CANCELLATIONAPPROVED',
                  'REJECTED',
                ],
              },
            },
            {
              refundamount: { not: 0 },
            },
          ],
          Transactions: { none: { status: 'REFUNDED' } },
        },
        orderBy: { bookingstart: 'desc' },
        select: {
          id: true,
          User: {
            select: {
              email: true,
              isCompanion: true,
              firstname: true,
              lastname: true,
            },
          },
          refundamount: true,
          cancellationDetails: { select: { isCompanion: true } },
          bookingstatus: true,
          finalRate: true,
          bookingstart: true,
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

  async getCompletedRefundBookingList(params: pageNoQueryDto) {
    try {
      const pageNo = Number(params.pageNo) || 1;
      const limit = 10;
      const [items, aggregateResult] = await this.prismaService.$transaction([
        this.prismaService.transactions.findMany({
          where: { status: 'REFUNDED' },
          orderBy: { createdAt: 'desc' },
          skip: (pageNo - 1) * limit,
          take: limit,
          select: {
            transactionTime: true,
            amount: true,
            txnid: true,
            paymentmethod: true,
            payurefid: true,
            Bookings: {
              select: {
                User: {
                  select: { email: true, isCompanion: true, firstname: true },
                },
              },
            },
          },
        }),
        this.prismaService.transactions.aggregate({
          where: { status: 'REFUNDED' },
          _count: { id: true },
        }),
      ]);
      const totalCount = aggregateResult._count.id;
      const totalPages = Math.ceil(totalCount / limit);
      const values = items.map((l) => ({
        ...l,
        transactionTime: String(l.transactionTime),
      }));
      const finalvalue = {
        totalPages,
        limit,
        currentPage: pageNo,
        bookings: values,
      };
      return { data: finalvalue };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
