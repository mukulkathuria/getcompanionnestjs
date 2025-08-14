import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Notificationhours } from 'src/constants/common.constants';
import {
  BookingDurationUnitEnum,
  BookingStatusEnum,
  cancelBookingInputDto,
  NotificationFromModuleEnum,
  pageNoQueryDto,
  userBookingBodyDto,
  UserBookingReturnDto,
  userRatingDto,
} from 'src/dto/bookings.dto';
import { successErrorReturnDto } from 'src/dto/common.dto';
import { UserlocationProfileDto } from 'src/dto/user.dto';
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
  validateUserAgentlocation,
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

  async getpreviousBookingsForUser(userId: string, params: pageNoQueryDto) {
    try {
      if (!userId) {
        return { error: { status: 422, message: 'userId is required' } };
      }
      const pageNo = Number(params.pageNo) || 1;
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          Booking: {
            where: { bookingend: { lt: Date.now() } },
            orderBy: { bookingend: 'desc' },
            include: {
              User: {
                select: {
                  id: true,
                  firstname: true,
                  isCompanion: true,
                  Images: true,
                  age: true,
                  gender: true,
                },
              },
              Sessions: { select: { sessionStartTime: true } },
            },
          },
        },
      });

      if (!data) {
        data['Booking'] = [];
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
      const finalvalue = {
        totalPages: Math.ceil(filtervalues.length / 5),
        limit: 5,
        currentPage: pageNo,
        bookings: filtervalues.slice((pageNo - 1) * 5, pageNo * 5),
      };
      return { data: finalvalue };
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
              bookingstatus: {
                in: [
                  'ACCEPTED',
                  'COMPLETED',
                  'TRANSACTIONPENDING',
                  'UNDERCANCELLATION',
                  'UNDEREXTENSION',
                  'UNDERREVIEW',
                ],
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
      console.log('While creating Whats the rate', rates);
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
              googleformattedadress:
                bookingDetails.bookinglocation.formattedaddress,
              googleloc: bookingDetails.bookinglocation.name,
              googleplaceextra: bookingDetails.bookinglocation.googleextra,
              userinput: bookingDetails.bookinglocation.userInput,
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
      const userDetails = await this.prismaService.user.findUnique({
        where: { id: companionId },
        include: {
          Booking: {
            where: {
              bookingstart: { gt: Date.now() },
              bookingstatus: {
                in: [
                  'ACCEPTED',
                  'TRANSACTIONPENDING',
                  'UNDERCANCELLATION',
                  'UNDEREXTENSION',
                  'UNDERREVIEW',
                ],
              },
            },
          },
        },
      });
      if (!userDetails || !userDetails.isCompanion) {
        return { error: { status: 422, message: 'Invalid User' } };
      }
      const filtereddata = filterSlotAvailability(userDetails.Booking);
      return { data: filtereddata };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async cancelBooking(input: cancelBookingInputDto, userId: string) {
    try {
      const { error } = checkValidCancelBookngInputs(input, userId);
      if (error) {
        return { error };
      }
      const bookingDetails = await this.prismaService.booking.findUnique({
        where: { id: input.bookingid },
        include: { User: true, Sessions: true, statusHistory: true },
      });
      if (!bookingDetails || bookingDetails.bookingstart <= Date.now()) {
        return { error: { status: 404, message: 'No Bookings found' } };
      } else if (bookingDetails.Sessions.length) {
        return {
          error: {
            status: 404,
            message: 'Session already in progress state now you cant cancel',
          },
        };
      }
      const cancelledByCompanion = bookingDetails.User.find(
        (l) => l.id === userId,
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
            statusHistory: {
              create: {
                actionType: 'CANCELLED',
                previousStatus: 'CANCELLED',
                comment: input.reason,
                newStatus: 'CANCELLED',
                actionPerformedBy: 'COMPANION',
              },
            },
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
            User: { connect: { id: companiondata.id } },
          },
        });
        return { success: 'Its under consideration. please contact admin' };
      }
      const timeofcancellation =
        Number(bookingDetails.bookingstart) - Date.now() / (1000 * 60 * 60);
      if (timeofcancellation <= 0) {
        return {
          error: { status: 422, message: "You can't cancel past booking" },
        };
      }
      const GSTamount = bookingDetails.finalRate * 0.18;
      const extendedBooking = bookingDetails.statusHistory.find(
        (l) => l.actionType === 'EXTENDED',
      );
      const totalrefundamount = extendedBooking.extendedHours
        ? extendedBooking.newRate * 0.7
        : bookingDetails.finalRate * 0.7;
      const cancelStatus = timeofcancellation > 24 ? BookingStatusEnum.CANCELLEDREFUNDPENDING
              : BookingStatusEnum.CANCELLED
      await this.prismaService.booking.update({
        where: { id: input.bookingid },
        data: {
          bookingstatus: cancelStatus,
          statusHistory: {
            create: {
              actionType: 'CANCELLED',
              previousStatus: cancelStatus,
              comment: input.reason,
              newStatus: cancelStatus,
              actionPerformedBy: 'USER',
            },
          },
        },
      });
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
          finalRate: true,
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
          User: {
            select: {
              id: true,
              isCompanion: true,
              Images: true,
              firstname: true,
            },
          },
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
              Meetinglocation: {
                select: { googleloc: true, googleformattedadress: true },
              },
              Sessions: { select: { sessionStartTime: true } },
            },
          },
        },
      });

      if (!data) {
        data['Booking'] = [];
      }
      const filtervalues = data.Booking.map((l) => ({
        bookingstart: String(l.bookingstart),
        bookingend: String(l.bookingend),
        status: l.bookingstatus,
        amount: l.finalRate,
        users: l.User,
        id: l.id,
        purpose: l.bookingpurpose,
        meetinglocation: {
          address: l.Meetinglocation[0].googleformattedadress,
          name: l.Meetinglocation[0].googleloc,
        },
        sessions: l.Sessions.map((l) => ({
          sessionstart: String(l.sessionStartTime),
        })),
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
            orderBy: { bookingstart: 'asc' },
            take: 10,
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
              Sessions: { select: { sessionStartTime: true } },
            },
          },
        },
      });

      if (!data) {
        data['Booking'] = [];
      }
      const filtervalues = data.Booking.map((l) => ({
        bookingstart: String(l.bookingstart),
        bookingend: String(l.bookingend),
        status: l.bookingstatus,
        amount: l.finalRate,
        users: l.User,
        id: l.id,
        purpose: l.bookingpurpose,
        sessions: l.Sessions.map((l) => ({
          sessionstart: String(l.sessionStartTime),
        })),
      }));
      return { data: filtervalues };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getpreviousBookingsForCompanion(
    userId: string,
    params: pageNoQueryDto,
  ) {
    try {
      if (!userId) {
        return { error: { status: 422, message: 'userId is required' } };
      }
      const pageNo = Number(params.pageNo) || 1;
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          Booking: {
            where: {
              OR: [
                {
                  bookingstatus: {
                    in: [
                      'ACCEPTED',
                      'CANCELLED',
                      'CANCELLATIONAPPROVED',
                      'COMPLETED',
                      'REJECTED',
                    ],
                  },
                  bookingend: { lt: Date.now() },
                },
                { bookingstatus: 'COMPLETED' },
              ],
            },
            orderBy: { bookingend: 'desc' },
            include: {
              User: {
                select: {
                  id: true,
                  firstname: true,
                  Images: true,
                  age: true,
                  gender: true,
                  isCompanion: true,
                },
              },
              Meetinglocation: {
                select: { googleloc: true, googleformattedadress: true },
              },
              Sessions: { select: { sessionStartTime: true } },
            },
          },
        },
      });

      if (!data) {
        data['Booking'] = [];
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
      const finalvalue = {
        totalPages: Math.ceil(filtervalues.length / 5),
        limit: 5,
        currentPage: pageNo,
        bookings: filtervalues.slice((pageNo - 1) * 5, pageNo * 5),
      };
      return { data: finalvalue };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getLiveLocationforBooking(bookingid: number, userid: string) {
    try {
      if (!bookingid || typeof bookingid !== 'number') {
        return { error: { status: 422, message: 'Booking Id is required' } };
      }
      const [currentbooking, livebooking] =
        await this.prismaService.$transaction([
          this.prismaService.booking.findUnique({ where: { id: bookingid } }),
          this.prismaService.livelocation.findMany({
            where: { booking: bookingid },
            orderBy: { createdAt: 'desc' },
            select: {
              lat: true,
              lng: true,
              userid: true,
              Booking: {
                select: {
                  Meetinglocation: { select: { lat: true, lng: true } },
                },
              },
            },
          }),
        ]);
      if (!currentbooking) {
        return { error: { status: 404, message: 'Booking not found' } };
      }
      const user = livebooking.find((l) => l.userid !== userid);
      const currentuser = livebooking.find((l) => l.userid === userid);
      const values = {
        currentlocation: user ? { lat: user.lat, lng: user.lng } : null,
        currentuser: currentuser
          ? { lat: currentuser.lat, lng: currentuser.lng }
          : null,
        destination: livebooking.length
          ? livebooking[0].Booking.Meetinglocation[0]
          : null,
      };
      return { data: values };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async updateLiveLocation(
    bookingid: number,
    bodyParams: UserlocationProfileDto,
    userid: string,
  ) {
    try {
      if (!bookingid || typeof bookingid !== 'number') {
        return { error: { status: 422, message: 'Booking Id is required' } };
      }
      const { error } = validateUserAgentlocation(bodyParams);
      if (error) {
        return { error };
      }
      const validbooking = await this.prismaService.livelocation.findMany({
        where: { userid, booking: bookingid },
      });
      if (validbooking.length) {
        await this.prismaService.livelocation.updateMany({
          where: { booking: bookingid, userid },
          data: {
            city: bodyParams.city,
            state: bodyParams.state,
            lat: bodyParams.lat,
            lng: bodyParams.lng,
          },
        });
      } else {
        await this.prismaService.livelocation.create({
          data: {
            city: bodyParams.city,
            state: bodyParams.state,
            lat: bodyParams.lat,
            lng: bodyParams.lng,
            User: { connect: { id: userid } },
            Booking: { connect: { id: bookingid } },
          },
        });
      }
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
