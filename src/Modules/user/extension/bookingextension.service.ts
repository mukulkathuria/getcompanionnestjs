import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class BookingExtentionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(BookingExtentionService.name);

  async getExtensionDetails() {
    try {
      const data = await this.prismaService.booking.findUnique({
        where: { id: 1 },
        include: {
          User: { select: { firstname: true, phoneno: true, email: true } },
          Meetinglocation: {
            select: { lat: true, lng: true, state: true, city: true },
          },
        },
      });
      if (!data || data.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      const values = {
        id: data.id,
        bookingstart: String(data.bookingstart),
        bookingend: String(data.bookingend),
        updatedrate: data.finalRate * data.extendedhours,
        bookingpurpose: data.bookingpurpose,
        extendedhours: data.extendedhours,
        meetinglocation: data.Meetinglocation[0],
        userdetails: data.User,
      };
      return { data: values };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async whenRejectedBooking() {
    try {
      const data = await this.prismaService.booking.findUnique({
        where: { id: 1 },
      });
      if (!data || data.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      await this.prismaService.booking.update({
        where: { id: 1 },
        data: {
          extendedhours: 0,
          bookingstatus: 'ACCEPTED',
          extentedfinalrate: 0,
          updatedLocation: null,
          updatedPurpose: null,
          extendedendtime: 0,
        },
      });
      return { success: true };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async updateLocationforExtensionBooking() {
    try {
      const data = await this.prismaService.booking.findUnique({
        where: { id: 1 },
      });
      if (!data || data.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      await this.prismaService.booking.update({
        where: { id: 1 },
        data: {
          Meetinglocation: {
            create: {
              islocationupdated: true,
              lat: 70,
              lng: 18,
              state: 'Maharashtra',
              city: 'Mumbai',
              basefrom: 'BOOKING',
            },
          },
        },
      });
      return { success: true };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async updateExtensionBookngDetails() {
    try {
      const data = await this.prismaService.booking.findUnique({
        where: { id: 1 },
      });
      if (!data || data.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      await this.prismaService.booking.update({
        where: { id: 1 },
        data: {
          extendedhours: 2,
          extentedfinalrate: 1450,
          bookingstatus: 'ACCEPTED',
          updatedLocation: 'Yes',
          updatedPurpose: 'Any Purpose',
        },
      });
      return { success: true };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
