import { Injectable, Logger } from '@nestjs/common';
import {
  BookingStatusEnum,
  updateextensionbokingInputDto,
} from 'src/dto/bookings.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { validateUpdateExtensionBooking } from 'src/validations/usersession.validation';

@Injectable()
export class BookingExtentionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(BookingExtentionService.name);

  async getExtensionDetails(bookingId: number) {
    try {
      if (!bookingId || typeof bookingId !== 'number') {
        return { error: { status: 422, message: 'Booking id is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
        include: {
          User: { select: { firstname: true, phoneno: true, email: true } },
          Meetinglocation: {
            select: {
              lat: true,
              lng: true,
              state: true,
              city: true,
              googleformattedadress: true,
              googleloc: true,
            },
          },
        },
      });
      if (!data || data?.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      const amount = data.finalRate * (data.extendedhours || 1);
      const values = {
        id: data.id,
        bookingstart: String(data.bookingstart),
        bookingend: String(data.bookingend),
        bookingrate: amount,
        updatedrate: amount + amount * 0.18,
        bookingpurpose: data.bookingpurpose,
        extendedhours: data.extendedhours,
        meetinglocation: data.Meetinglocation[0],
        userdetails: data.User.map((l) => ({
          ...l,
          phoneno: String(l.phoneno),
        })),
      };
      return { data: values };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async whenRejectedBooking(bookingId: number) {
    try {
      if (!bookingId || typeof bookingId !== 'number') {
        return { error: { status: 422, message: 'Booking id is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
      });
      if (!data || data.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      await this.prismaService.booking.update({
        where: { id: bookingId },
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

  async updateExtensionBookngDetails(
    bookingdetails: updateextensionbokingInputDto,
  ) {
    try {
      const { error } = validateUpdateExtensionBooking(bookingdetails);
      if (error) {
        return { error };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: bookingdetails.bookingid },
      });
      if (!data || data.bookingstatus !== 'UNDEREXTENSION') {
        return { error: { status: 422, message: 'Booking not available' } };
      }
      let bookingdata = {
        extendedhours: bookingdetails.extendedhours,
        extentedfinalrate: bookingdetails.extentedfinalrate,
        bookingstatus: BookingStatusEnum.ACCEPTED,
        updatedLocation: bookingdetails.updatedLocation ? 'Yes' : null,
        updatedPurpose: bookingdetails.updatedPurpose,
      };
      if (bookingdetails.updatedLocation) {
        bookingdata['Meetinglocation'] = {
          create: {
            city: bookingdetails.updatedLocation.city,
            state: bookingdetails.updatedLocation.state,
            googleformattedadress:
              bookingdetails.updatedLocation.formattedaddress,
            googleloc: bookingdetails.updatedLocation.name,
            userinput: bookingdetails.updatedLocation.userInput,
            lat: bookingdetails.updatedLocation.lat,
            lng: bookingdetails.updatedLocation.lng,
            googleplaceextra: bookingdetails.updatedLocation.googleextra,
            islocationupdated: true,
            basefrom: 'BOOKING',
          },
        };
      }
      await this.prismaService.booking.update({
        where: { id: bookingdetails.bookingid },
        data: bookingdata,
      });
      return { success: true };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
