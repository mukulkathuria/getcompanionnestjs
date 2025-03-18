import { Injectable, Logger } from '@nestjs/common';
import {
  statusUpdateInputDto,
  updateCompanionPriceInputDto,
} from 'src/dto/admin.module.dto';
import {
  AccountEnum,
  previousImagesDto,
  registerCompanionBodyDto,
} from 'src/dto/auth.module.dto';
import { successErrorDto } from 'src/dto/common.dto';
import {
  CompanionBookingUnitEnum,
  UpdateCompanionProfileBodyDto,
} from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';
import {
  getdefaultexpirydate,
  getUniqueValue,
  subDays,
} from 'src/utils/common.utils';
import { encrypt } from 'src/utils/crypt.utils';
import {
  validatepreviousImages,
  validateregisterCompanion,
} from 'src/validations/auth.validation';
import { validateRequestInput } from 'src/validations/companionrequest.validation';
import { isvalidComanioninputs } from 'src/validations/user.validations';

@Injectable()
export class CompanionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async registerCompanion(
    userinfo: registerCompanionBodyDto,
    images: Express.Multer.File[],
  ): Promise<successErrorDto> {
    const { user, error } = validateregisterCompanion(userinfo);
    if (error) {
      return { error };
    }
    try {
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });
      if (isUserExists) {
        return { error: { status: 422, message: 'User already exists' } };
      }
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      if (allimages.length < 2) {
        return {
          error: { status: 422, message: 'Atleast 2 images are required' },
        };
      }
      if (allimages.length > 4) {
        return {
          error: { status: 422, message: 'Images more than 4 is not allowed' },
        };
      }
      const location = {
        city: user?.city,
        state: user?.state,
        zipcode: Number(user?.zipcode) || null,
        lat: Number(user?.lat) || null,
        lng: Number(user?.lng) || null,
      };
      const userdata = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: encrypt(user.password),
        gender: user.gender,
        age: Number(user.age),
        isCompanion: true,
        Images: allimages,
        lastlogin: Date.now(),
        phoneno: Number(user.phoneno),
        expiryDate: getdefaultexpirydate(),
      };
      const companion = {
        bookingrate: Number(user?.bookingrate) || null,
        bookingrateunit: CompanionBookingUnitEnum.PERHOUR,
        description: user.description,
        Skintone: user.skintone,
        height: Number(user.height),
        bodytype: user.bodytype,
        eatinghabits: user.eatinghabits,
        drinkinghabits: user.drinkinghabits,
        smokinghabits: user.smokinghabits,
        account: AccountEnum.ACCEPTED,
        baselocation: { create: location },
      };
      await this.prismaService.user.create({
        data: { ...userdata, Companion: { create: companion } },
      });
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async updateUserProfile(
    userinputs: UpdateCompanionProfileBodyDto,
    images: Express.Multer.File[],
    id: string,
  ) {
    try {
      const isUserExists = await this.prismaService.user.findUnique({
        where: { id },
        include: { Companion: { include: { baselocation: true } } },
      });
      if (!isUserExists) {
        return { error: { status: 422, message: 'User not Exists' } };
      }
      const { userdata, locationdata, companiondata } =
        isvalidComanioninputs(userinputs);
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      if (allimages.length > 4) {
        return {
          error: { status: 422, message: 'Images more than 4 is not allowed' },
        };
      }
      // eslint-disable-next-line
      const updateuser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userdata,
          Images: allimages.length ? allimages : userinputs.Images,
          Companion: {
            update: {
              where: { userid: id },
              data: {
                ...companiondata,
                baselocation: {
                  update: {
                    where: { id: isUserExists.Companion[0].baselocation[0].id },
                    data: locationdata,
                  },
                },
              },
            },
          },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }

  async getUpdateCompanionList() {
    try {
      const data = await this.prismaService.companionupdaterequest.findMany({
        where: { status: 'REVIEWED' },
        select: {
          firstname: true,
          Images: true,
          id: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return { data };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }

  async getUpdateCompanionDetails(id: number) {
    try {
      if (!id || typeof id !== 'number') {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const data = await this.prismaService.companionupdaterequest.findUnique({
        where: { id },
        include: {
          companiondetails: {
            select: {
              User: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  phoneno: true,
                  age: true,
                  Images: true,
                  gender: true,
                },
              },
              bookingrate: true,
              description: true,
              Skintone: true,
              height: true,
              bodytype: true,
              eatinghabits: true,
              drinkinghabits: true,
              smokinghabits: true,
              account: true,
            },
          },
        },
      });
      if (!data) {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const values = {
        ...data,
        companiondetails: {
          ...data.companiondetails,
          User: {
            ...data.companiondetails.User,
            phoneno: String(data.companiondetails.User.phoneno),
          },
        },
      };
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }

  async updateCompanionDetails(
    userinfo: registerCompanionBodyDto & previousImagesDto,
    images: Express.Multer.File[],
    id: string,
  ): Promise<successErrorDto> {
    const { user, error } = validateregisterCompanion(userinfo, true);
    if (error) {
      return { error };
    }
    try {
      const isUserExists = await this.prismaService.user.findUnique({
        where: { id },
        include: { Companion: { include: { baselocation: true } } },
      });
      if (!isUserExists) {
        return { error: { status: 422, message: 'User not Exists' } };
      }
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      const { images: previousImages, error: imagesError } =
        validatepreviousImages(userinfo.previousImages);
      if (imagesError) {
        return { error: imagesError };
      }
      if (!userinfo.previousImages && allimages.length < 2) {
        return {
          error: { status: 422, message: 'Images is required' },
        };
      } else if (
        previousImages?.length + allimages.length < 2 ||
        previousImages?.length + allimages.length > 4
      ) {
        return {
          error: { status: 422, message: 'Images should be between 2 and 4' },
        };
      }
      if (allimages.length >= 1) {
        user['Images'] = userinfo.previousImages
          ? [...allimages, ...previousImages]
          : allimages;
      } else {
        user['Images'] = previousImages;
      }
      delete userinfo.previousImages;
      const location = {
        city: user?.city,
        state: user?.state,
        zipcode: Number(user?.zipcode) || null,
        lat: Number(user?.lat) || null,
        lng: Number(user?.lng) || null,
      };
      const userdata = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        age: Number(user.age),
        // isCompanion: true,
        Images: user.Images,
        phoneno: Number(user.phoneno),
      };
      const companion = {
        bookingrate: Number(user?.bookingrate) || null,
        bookingrateunit: CompanionBookingUnitEnum.PERHOUR,
        description: user.description,
        Skintone: user.skintone,
        height: Number(user.height),
        bodytype: user.bodytype,
        eatinghabits: user.eatinghabits,
        drinkinghabits: user.drinkinghabits,
        smokinghabits: user.smokinghabits,
      };
      await this.prismaService.user.update({
        where: { email: user.email },
        data: {
          ...userdata,
          Companion: {
            update: {
              where: { userid: id },
              data: {
                ...companion,
                baselocation: {
                  update: {
                    where: { id: isUserExists.Companion[0].baselocation[0].id },
                    data: location,
                  },
                },
              },
            },
          },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }

  async updateCompanionStatus(companioninput: statusUpdateInputDto) {
    try {
      const id = Number(companioninput.id);
      if (!id || typeof id !== 'number') {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const { error } = validateRequestInput(companioninput, 'Companion');
      if (error) {
        return { error };
      }
      await this.prismaService.companionupdaterequest.update({
        where: { id },
        data: { status: companioninput.approve ? 'ACCEPTED' : 'REJECTED' },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }

  async getCompanionListByLocation() {
    try {
      const data = await this.prismaService.user.findMany({
        where: {
          isCompanion: true,
          Companion: {
            every: {
              baselocation: { every: { city: 'Mumbai', state: 'Maharashtra' } },
            },
          },
        },
        select: {
          id: true,
          firstname: true,
          gender: true,
          Images: true,
          Companion: { select: { bookingrate: true } },
          age: true,
          Booking: {
            where: {
              bookingstart: { gt: subDays(7) },
              bookingstatus: { in: ['ACCEPTED', 'COMPLETED'] },
            },
            select: { bookingduration: true },
          },
          ratingsReceived: { select: { ratings: true } },
        },
      });
      const values = data.map((l) => ({
        ...l,
        Companion: l.Companion[0].bookingrate,
        Booking: l.Booking.reduce((a, b) => a + b.bookingduration, 0),
        ratingsReceived: l.ratingsReceived.reduce((a, b) => a + b.ratings, 0),
        totalRatings: l.ratingsReceived.length,
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getCompanionDetailsforupdateRate(id: string) {
    try {
      const { getCompanionDetailsQueryforupdateRate } = await import(
        '../../../utils/booking.utils'
      );
      const query = getCompanionDetailsQueryforupdateRate(id);
      const data = (await this.prismaService.$queryRawUnsafe(query)) as any;
      const value = {
        ...data[0],
        last24hoursbookings: data[0].last24hoursbookings
          ? getUniqueValue(data[0].last24hoursbookings)
          : data[0].last24hoursbookings,
        last7daysbookings: data[0].last7daysbookings
          ? getUniqueValue(data[0].last7daysbookings)
          : data[0].last7daysbookings,
        last30daysbookings: data[0].last30daysbookings
          ? getUniqueValue(data[0].last30daysbookings)
          : data[0].last30daysbookings,
      };
      return { data: value };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getnewCompanionRequestlist() {
    try {
      const data = await this.prismaService.companionrequests.findMany({
        where: { status: 'ACTIVE' },
      });
      const values = data.map((l) => ({
        id: l.id,
        firstname: l.firstname,
        email: l.email,
        age: l.age,
        images: l.photos,
        gender: l.gender,
      }));
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getnewCompanionRequestDetails(id: number) {
    try {
      const data = await this.prismaService.companionrequests.findUnique({
        where: { id },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phoneNo: true,
          photos: true,
          age: true,
        },
      });
      if (!data) {
        return { error: { status: 404, message: 'Companion not found' } };
      }
      const values = { ...data, phoneNo: String(data.phoneNo) };
      return { data: values };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async updateCompanionBasePrice(
    inputs: updateCompanionPriceInputDto,
    id: string,
  ): Promise<successErrorDto> {
    try {
      if (!id || !id.trim().length) {
        return { error: { status: 422, message: 'Companion Id is required' } };
      } else if (
        !inputs.updatedprice ||
        typeof inputs.updatedprice !== 'number'
      ) {
        return { error: { status: 422, message: 'Invalid updated price' } };
      }
      await this.prismaService.companion.update({
        where: { userid: id },
        data: { bookingrate: inputs.updatedprice },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
