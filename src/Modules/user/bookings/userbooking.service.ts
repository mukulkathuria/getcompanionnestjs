import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Notificationhours } from 'src/constants/common.constants';
import {
  BookingDurationUnitEnum,
  BookingStatusEnum,
  cancelBookingInputDto,
  NotificationFromModuleEnum,
  userBookingBodyDto,
  UserBookingReturnDto,
  userRatingDto,
} from 'src/dto/bookings.dto';
import { successErrorReturnDto } from 'src/dto/common.dto';
import { NodeMailerService } from 'src/Services/nodemailer.service';
import { PrismaService } from 'src/Services/prisma.service';
import emailTemplate from 'src/templates/email.template';
import notificationTemplate from 'src/templates/notification.template';
import { filterSlotAvailability, getFinalRate } from 'src/utils/booking.utils';
import { addHours, convertToDateTime, createOTP } from 'src/utils/common.utils';
import {
  checkValidCancelBookngInputs,
  checkvalidrating,
  isUserBookingValid,
} from 'src/validations/booking.validation';

@Injectable()
export class UserBookingsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodemailerService: NodeMailerService,
  ) {}
  private readonly logger = new Logger(UserBookingsService.name);

  async getAllBookingsForUser(userId: string): Promise<UserBookingReturnDto> {
    try {
      if (!userId) {
        return { error: { status: 422, message: 'userId is required' } };
      }
      const data = await this.prismaService.booking.findMany({
        where: { bookingstart: { gt: Date.now() }, bookingstatus: 'ACCEPTED' },
        include: { User: { where: { id: userId } } },
      });
      if (!data) {
        return { error: { status: 404, message: 'No Bookings are available' } };
      }
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getpreviousBookingsForUser(userId: string) {
    try {
      if (!userId) {
        return { error: { status: 422, message: 'userId is required' } };
      }
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          Booking: {
            orderBy: { bookingend: 'desc' },
            take: 5,
            include: {
              User: {
                select: {
                  firstname: true,
                  isCompanion: true,
                  Images: true,
                  age: true,
                  gender: true,
                },
              },
              Meetinglocation: { select: { city: true, state: true } },
            },
          },
        },
      });

      if (!data || !data.Booking.length) {
        return { error: { status: 404, message: 'No Bookings are available' } };
      }
      const filtervalues = data.Booking.map((l) => ({
        bookingstart: String(l.bookingstart),
        bookingend: String(l.bookingend),
        status: l.bookingstatus,
        amount: l.finalRate,
        users: l.User,
        id: l.id,
        purpose: l.bookingpurpose,
        meetinglocation: l.Meetinglocation,
      }));
      return { data: filtervalues };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async bookaCompanion(bookingDetails: userBookingBodyDto) {
    try {
      const { error } = isUserBookingValid(bookingDetails);
      if (error) {
        return { error };
      }
      const hrmin =
        bookingDetails.bookingdurationUnit === BookingDurationUnitEnum.HOUR
          ? 'hour'
          : 'minute';
      const endDate = new Date(bookingDetails.bookingdate).setHours(
        new Date(bookingDetails.bookingdate).getHours() +
          bookingDetails.bookingduration,
      );
      const isSlotAvailable = await this.prismaService.user.findMany({
        where: { id: bookingDetails.companionId, isCompanion: true },
        include: {
          Booking: {
            where: {
              bookingstart: {
                gte: new Date(bookingDetails.bookingdate).setHours(
                  new Date(bookingDetails.bookingdate).getHours() - 1,
                ),
              },
              bookingend: {
                lte: dayjs(endDate).add(1, 'hour').valueOf(),
              },
            },
          },
          Companion: true,
        },
      });
      if (isSlotAvailable[0].Booking.length) {
        return { error: { status: 422, message: 'Slot not available' } };
      }
      const rates = {
        bookingrate: isSlotAvailable[0].Companion[0].bookingrate,
        finalRate: getFinalRate(
          bookingDetails,
          isSlotAvailable[0].Companion[0],
        ),
      };
      // eslint-disable-next-line
      const data = await this.prismaService.booking.create({
        data: {
          User: {
            connect: [
              { id: bookingDetails.userId },
              { id: bookingDetails.companionId },
            ],
          },
          ChatRoom: {
            create: {
              User: {
                connect: [
                  { id: bookingDetails.userId },
                  { id: bookingDetails.companionId },
                ],
              },
            },
          },
          bookingduration: bookingDetails.bookingduration,
          bookingstart: dayjs(bookingDetails.bookingdate).toDate().getTime(),
          bookingpurpose: bookingDetails.purpose,
          bookingend: endDate,
          OTP: createOTP(),
          bookingstatus: BookingStatusEnum['TRANSACTIONPENDING'],
          bookingdurationUnit: bookingDetails.bookingdurationUnit,
          Meetinglocation: {
            create: {
              city: bookingDetails.bookinglocation.city,
              state: bookingDetails.bookinglocation.state,
              lat: bookingDetails.bookinglocation.lat,
              lng: bookingDetails.bookinglocation.lng,
              basefrom: 'BOOKING',
            },
          },
          ...rates,
        },
      });
      return { success: true, bookingid: data.id };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async checkBookedSlotsforCompanion(companionId: string) {
    try {
      if (!companionId) {
        return { error: { status: 422, message: 'companionid is required' } };
      }
      const userdata = await this.prismaService.booking.findMany({
        where: { bookingend: { lt: Date.now() } },
        include: { User: { where: { id: companionId, isCompanion: true } } },
      });
      const filtereddata = filterSlotAvailability(userdata);
      return { data: filtereddata };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async cancelBooking(input: cancelBookingInputDto) {
    try {
      const { error } = checkValidCancelBookngInputs(input);
      if (error) {
        return { error };
      }
      const bookingDetails = await this.prismaService.booking.findUnique({
        where: { id: input.bookingid },
        include: { User: true },
      });
      if (!bookingDetails || bookingDetails.bookingstart <= Date.now()) {
        return { error: { status: 404, message: 'No Bookings found' } };
      }
      const cancelledByCompanion = bookingDetails.User.find(
        (l) => l.id === input.userId,
      );
      const userdata = bookingDetails.User.find((l) => !l.isCompanion);
      const companiondata = bookingDetails.User.find((l) => l.isCompanion);
      if (cancelledByCompanion.isCompanion) {
        if (!input.reason || !input.reason.trim().length) {
          return { error: { status: 422, message: 'Reason is required' } };
        }
        await this.prismaService.booking.update({
          where: { id: input.bookingid },
          data: {
            bookingstatus: BookingStatusEnum.UNDERCANCELLATION,
            cancelledReason: input.reason,
            cancellationDetails:{ connect: { id: input.userId } },
            cancelledAt: Date.now(),
          },
        });
        await this.prismaService.notification.create({
          data: {
            fromModule: NotificationFromModuleEnum.BOOKING,
            expiry: addHours(Notificationhours.cancellationbyadmin),
            content: notificationTemplate({
              companion_name: companiondata.firstname,
              username: userdata.firstname,
              date_time: convertToDateTime(bookingDetails.bookingstart),
            }).cancelationrequestbycompanion,
            contentforadmin: `${companiondata.firstname} has requested for cancellation see more details here.`,
            User: { connect: { id: userdata.id } },
          },
        });
        return { success: 'Its under consideration. please contact admin' };
      }
      const timeofcancellation =
        Number(bookingDetails.bookingstart) - Date.now() / (1000 * 60 * 60);
      if (timeofcancellation < 0) {
        return {
          error: { status: 422, message: "You can't cancel past booking" },
        };
      }
      await this.prismaService.booking.update({
        where: { id: input.bookingid },
        data: {
          bookingstatus: BookingStatusEnum.CANCELLED,
          cancellationDetails:{ connect: { id: input.userId } },
          cancelledAt: Date.now(),
        },
      });
      const totalrefundamount = bookingDetails.finalRate * 0.7;
      await this.prismaService.notification.create({
        data: {
          fromModule: NotificationFromModuleEnum.BOOKING,
          expiry: addHours(Notificationhours.cancellationbyuser),
          content: notificationTemplate({
            companion_name: companiondata.firstname,
          }).cancelationbyuser,
          contentforadmin:
            timeofcancellation > 24
              ? `${userdata.firstname} is cancelled for companion ${companiondata.firstname} with refunded amount of ${totalrefundamount}`
              : null,
          User: { connect: { id: userdata.id } },
        },
      });
      const { usercancelbooking, refundprocess } = emailTemplate({
        username: userdata.firstname,
        companion_name: companiondata.firstname,
        refundamount: `${totalrefundamount}`,
      });

      if (timeofcancellation < 24) {
        this.nodemailerService
          .sendMail({
            from: process.env['BREVO_SENDER_EMAIL'],
            to: userdata.email,
            subject: usercancelbooking.subject,
            html: usercancelbooking.body,
          })
          .then(() => {
            this.logger.log(`Email sent to: ${userdata.email}`);
          });
      } else {
        this.nodemailerService
          .sendMail({
            from: process.env['BREVO_SENDER_EMAIL'],
            to: userdata.email,
            subject: refundprocess.subject,
            html: refundprocess.body,
          })
          .then(() => {
            this.logger.log(`Email sent to: ${userdata.email}`);
          });
        // cancel booking transaction pending
      }
      return { success: `Successfully cancelled the booking` };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getUserBookingDetails(bookingid: string) {
    try {
      const booking = Number(bookingid);
      if (isNaN(booking) || !bookingid) {
        return { error: { status: 422, message: 'Booking Id is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: booking },
        select: {
          User: {
            select: {
              firstname: true,
              email: true,
              isCompanion: true,
              phoneno: true,
            },
          },
          bookingduration: true,
          bookingrate: true,
          bookingdurationUnit: true,
          bookingstatus: true,
          id: true,
        },
      });
      if (!data) {
        return { error: { status: 404, message: 'Booking not found' } };
      } else if (data.bookingstatus !== 'TRANSACTIONPENDING') {
        return { error: { status: 404, message: 'Transaction Already done' } };
      }
      return {
        data: {
          ...data,
          User: data.User.map((l) => ({ ...l, phoneno: String(l.phoneno) })),
        },
      };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async rateabookingservice(
    userInputs: userRatingDto,
  ): Promise<successErrorReturnDto> {
    try {
      const { error } = checkvalidrating(userInputs);
      if (error) {
        return { error };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: userInputs.bookingid },
        include: {
          User: { select: { id: true } },
          rating: { select: { raterId: true } },
        },
      });
      if (!data || !data.User.filter((l) => l.id === userInputs.userId)[0]) {
        return { error: { status: 404, message: 'Booking not found' } };
      } else if (data.rating.find((l) => l.raterId === userInputs.userId)) {
        return { error: { status: 422, message: 'Already rated by you!' } };
      }
      const rateeId = data.User.find((l) => l.id !== userInputs.userId);
      await this.prismaService.rating.create({
        data: {
          Booking: { connect: { id: userInputs.bookingid } },
          rater: { connect: { id: userInputs.userId } },
          ratee: { connect: { id: rateeId.id } },
          comment: userInputs.comment,
          ratings: userInputs.rating,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getBookingforAllService(bookingid: string) {
    try {
      const booking = Number(bookingid);
      if (isNaN(booking) || !bookingid) {
        return { error: { status: 422, message: 'Booking Id is required' } };
      }
      const data = await this.prismaService.booking.findUnique({
        where: { id: booking },
        select: {
          User: { select: { id: true, isCompanion: true, Images: true } },
          bookingstart: true,
          bookingend: true,
        },
      });
      return {
        data: {
          ...data,
          bookingstart: String(data.bookingstart),
          bookingend: String(data.bookingend),
        },
      };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getRatingforUser(userId: string) {
    try {
      const { getAverageRatingRawQuery } = await import(
        '../../../utils/booking.utils'
      );
      const query = await getAverageRatingRawQuery(userId);
      const data = (await this.prismaService.$queryRawUnsafe(query)) as any;
      const values = data
        ? data?.map((l) => ({
            ...l,
            avg_rating: String(l.avg_rating),
            last_rating: String(l.last_rating),
            rating_count: String(l.rating_count),
            bayesian_avg: String(l.bayesian_avg),
          }))
        : [];
      return { data: values };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getUpcomingBookingsForCompanion(userId: string) {
    try {
      if (!userId) {
        return { error: { status: 422, message: 'userId is required' } };
      }
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          Booking: {
            where: {
              bookingstart: { gt: Date.now() },
              bookingstatus: 'ACCEPTED',
            },
            orderBy: { bookingend: 'desc' },
            take: 5,
            include: {
              User: {
                select: {
                  firstname: true,
                  isCompanion: true,
                  Images: true,
                  age: true,
                  gender: true,
                },
              },
              Meetinglocation: { select: { city: true, state: true } },
            },
          },
        },
      });

      if (!data) {
        return { error: { status: 404, message: 'No Bookings are available' } };
      }
      const filtervalues = data.Booking.map((l) => ({
        bookingstart: String(l.bookingstart),
        bookingend: String(l.bookingend),
        status: l.bookingstatus,
        amount: l.finalRate,
        users: l.User,
        id: l.id,
        purpose: l.bookingpurpose,
        meetinglocation: l.Meetinglocation,
      }));
      return { data: filtervalues };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getUpcomingBookingsForUser(userId: string) {
    try {
      if (!userId) {
        return { error: { status: 422, message: 'userId is required' } };
      }
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          Booking: {
            where: { bookingstart: { gt: Date.now() } },
            orderBy: { bookingend: 'desc' },
            take: 5,
            include: {
              User: {
                select: {
                  firstname: true,
                  isCompanion: true,
                  Images: true,
                  age: true,
                  gender: true,
                },
              },
            },
          },
        },
      });

      if (!data) {
        return { error: { status: 404, message: 'No Bookings are available' } };
      }
      const filtervalues = data.Booking.map((l) => ({
        bookingstart: String(l.bookingstart),
        bookingend: String(l.bookingend),
        status: l.bookingstatus,
        amount: l.finalRate,
        users: l.User,
        id: l.id,
        purpose: l.bookingpurpose,
      }));
      return { data: filtervalues };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
