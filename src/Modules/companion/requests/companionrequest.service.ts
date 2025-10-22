import { Injectable, Logger } from '@nestjs/common';
import { AccountEnum, registerCompanionBodyDto } from 'src/dto/auth.module.dto';
import { successErrorDto } from 'src/dto/common.dto';
import {
  CompanionBookingUnitEnum,
  GenderEnum,
  registercompanionInputDto,
} from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { S3Service } from 'src/Services/s3.service';
import { addDays, getdefaultexpirydate } from 'src/utils/common.utils';
import { encrypt } from 'src/utils/crypt.utils';
import { handleImageInStorage } from 'src/utils/imageDownload.utils';
import { validateregisterCompanion } from 'src/validations/auth.validation';
import { validateCompanionRequestInput } from 'src/validations/companionrequest.validation';

@Injectable()
export class CompanionRequestService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsservice: S3Service,
  ) {}
  private readonly logger = new Logger(CompanionRequestService.name);

  async requestforcompanion(
    userinfo: registercompanionInputDto,
    images: Express.Multer.File[],
  ): Promise<successErrorDto> {
    const { error } = validateCompanionRequestInput(userinfo);
    if (error) {
      return { error };
    }
    try {
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: userinfo.email },
      });
      if (isUserExists) {
        return { error: { status: 422, message: 'Email Already exists' } };
      }
      if (!images.length) {
        return { error: { status: 422, message: 'images are required' } };
      } else if (images.length < 2) {
        return { error: { status: 422, message: 'Minimum 2 Images required' } };
      } else if (images.length > 2) {
        return {
          error: { status: 422, message: 'Maximum 2 images are allowed' },
        };
      }
      const allimages = await handleImageInStorage(
        images,
        'companionrequest/' + userinfo.email,
      );
      const userdata = {
        firstname: userinfo.firstname,
        lastname: userinfo.lastname,
        email: userinfo.email,
        gender: GenderEnum[userinfo.gender],
        age: Number(userinfo.age),
        photos: [...allimages],
        phoneNo: Number(userinfo.phoneno),
      };
      await this.prismaService.companionrequests.create({ data: userdata });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

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
      const allimages = await handleImageInStorage(
        images,
        'companionrequest/' + userinfo.email,
      );
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
      const location = userinfo.baselocations.map((l) => ({
        city: l.city,
        state: l.state,
        googleformattedadress: l.formattedaddress,
        googleloc: l.name,
        userinput: l.userInput,
        lat: l.lat,
        lng: l.lng,
        googleplaceextra: l.googleextra,
      }));
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
        userpaymentmethods: {
          createMany: {
            data: user.paymentmethods,
          },
        },
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
        account: AccountEnum.REVIEWED,
        CompanionAvailability: {
          create: { startDate: Date.now(), endDate: addDays(3).valueOf() },
        },
        baselocation: { createMany: { data: location } },
      };
      await this.prismaService.user.create({
        data: {
          ...userdata,
          Companion: {
            create: companion,
          },
        },
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
}
