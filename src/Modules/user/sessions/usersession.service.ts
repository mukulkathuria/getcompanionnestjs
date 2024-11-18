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
import emailTemplate from 'src/templates/email.template';
import { NodeMailerService } from 'src/Services/nodemailer.service';

@Injectable()
export class UserSessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodemailerService: NodeMailerService,
  ) {}
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
          sessionStartTime: new Date().getTime(),
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
      const userdata = await this.prismaService.sessions.findUnique({
        where: { id: sessionDetails.sessionid },
        include: {
          Bookings: {
            include: {
              User: {
                select: { firstname: true, isCompanion: true, email: true },
              },
            },
          },
        },
      });
      if (!userdata) {
        return { error: { status: 422, message: 'session not found' } };
      }
      const companiondata = userdata.Bookings.User.find((l) => l.isCompanion);
      const data = await this.prismaService.sessions.update({
        where: { id: sessionDetails.sessionid },
        data: {
          Bookings: {
            update: {
              data: { bookingstatus: 'COMPLETED' }, //bookingend: Date.now()
            },
          },
          sessionEndTime: Date.now(),
        },
      });
      const user = userdata.Bookings.User.find((l) => !l.isCompanion);
      const {
        feedbackrequest: { subject, body },
      } = emailTemplate({
        username: user.firstname,
        companion_name: companiondata.firstname,
      });
      this.nodemailerService
        .sendMail({
          from: process.env['BREVO_SENDER_EMAIL'],
          to: user.email,
          subject,
          html: body,
        })
        .then(() => {
          this.logger.log(`Email sent to: ${user.email}`);
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
                lte: dayjs(endTime).toDate().getTime(),
              },
              bookingend: {
                gt: dayjs(endTime).toDate().getTime(),
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
          sessionEndTime: endTime.getTime(),
          // Bookings: {
          //   update: {
          //     where: { id: getBookingDetails.bookingid },
          //     data: { bookingend: endTime.getTime() },
          //   },
          // },
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
