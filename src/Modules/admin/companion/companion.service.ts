import { Injectable, Logger } from '@nestjs/common';
import { registerCompanionBodyDto } from 'src/dto/auth.module.dto';
import { successErrorDto } from 'src/dto/common.dto';
import {
  CompanionBookingUnitEnum,
  UpdateUserProfileBodyDto,
} from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { getdefaultexpirydate } from 'src/utils/common.utils';
import { encrypt } from 'src/utils/crypt.utils';
import { validateregisterCompanion } from 'src/validations/auth.validation';
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
      } else if (allimages.length > 4) {
        return {
          error: { status: 422, message: 'Images more than 4 is not allowed' },
        };
      }
      const location = {
        city: user?.city,
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
        location: { create: location },
        lastlogin: Date.now(),
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
      };
      userdata['Companion'] = { create: companion };
      await this.prismaService.user.create({
        data: userdata,
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
    userinputs: UpdateUserProfileBodyDto,
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
          error: { status: 422, message: 'Images more than 3 is not allowed' },
        };
      }
      // eslint-disable-next-line
      const updateuser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userdata,
          Images: allimages,
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
}
