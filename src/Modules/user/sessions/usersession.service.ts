import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import * as dayjs from 'dayjs';
import {
  SessionExtendBodyParamsDto,
  SessionIdBodyParamsDto,
  StartBookingBodyparamsDto,
} from 'src/dto/usersession.dto';
import {
  checkValidEndSessionData,
  checkValidExtendSessionData,
  checkValidStartSessionData,
} from 'src/validations/usersession.validation';

@Injectable()
export class UserSessionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UserSessionService.name);

  async startSession(sessionDetails: StartBookingBodyparamsDto) {
    try {
      const { error } = checkValidStartSessionData(sessionDetails);
      if (error) {
        return { error };
      }
      const checkBookingandOTP = await this.prismaService.booking.findUnique({
        where: { id: sessionDetails.bookingid, OTP: sessionDetails.otp },
      });
      if (!checkBookingandOTP) {
        return { error: { status: 422, message: 'Booking not found' } };
      }
      const data = await this.prismaService.sessions.create({
        data: {
          bookingid: sessionDetails.bookingid,
          sessionStartTime: new Date(),
          sessionEndTime: checkBookingandOTP.bookingend,
          isExtended: false,
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async endSession(sessionDetails: SessionIdBodyParamsDto) {
    try {
      const { error } = checkValidEndSessionData(sessionDetails);
      if (error) {
        return { error };
      }
      const data = await this.prismaService.sessions.update({
        where: { id: sessionDetails.sessionid },
        data: {
          sessionEndTime: new Date(),
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async extendSession(sessionDetails: SessionExtendBodyParamsDto) {
    try {
      const { error } = checkValidExtendSessionData(sessionDetails);
      if (error) {
        return { error };
      }
      const endTime = new Date(sessionDetails.endtime);
      const getBookingDetails = await this.prismaService.sessions.findUnique({
        where: { id: sessionDetails.sessionid },
        include: { Bookings: { include: { User: true } } },
      });
      if (!getBookingDetails) {
        return { error: { status: 422, message: 'Booking not found' } };
      }
      const companionuser = getBookingDetails.Bookings.User.find(
        (l) => l.isCompanion,
      );
      const isSlotAvailable = await this.prismaService.user.findMany({
        where: { id: companionuser.id, isCompanion: true },
        include: {
          Booking: {
            where: {
              bookingstart: {
                lte: dayjs(endTime).toDate(),
              },
              bookingend: {
                gt: dayjs(endTime).toDate(),
              },
            },
          },
          Companion: true,
        },
      });
      if (isSlotAvailable[0].Booking.length) {
        return { error: { status: 422, message: 'Slot not available' } };
      }
      const data = await this.prismaService.sessions.update({
        where: { id: sessionDetails.sessionid },
        data: {
          isExtended: true,
          sessionEndTime: endTime,
          Bookings: {
            update: {
              where: { id: getBookingDetails.bookingid },
              data: { bookingstatus: 'COMPLETED' },
            },
          },
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
