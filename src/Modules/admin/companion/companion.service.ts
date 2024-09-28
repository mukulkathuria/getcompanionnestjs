import { Injectable, Logger } from '@nestjs/common';
import { registerBodyDto } from 'src/dto/auth.module.dto';
import { successErrorDto } from 'src/dto/common.dto';
import {
  CompanionBookingUnitEnum,
  UpdateUserProfileBodyDto,
} from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { encrypt } from 'src/utils/crypt.utils';
import { validateregisterUser } from 'src/validations/auth.validation';
import { isvalidComanioninputs } from 'src/validations/user.validations';


@Injectable()
export class CompanionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async registerCompanion(
    userinfo: registerBodyDto,
    images: Express.Multer.File[],
  ): Promise<successErrorDto> {
    const { user, error } = validateregisterUser(userinfo);
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
      };
      if (user.isCompanion) {
        const companion = {
          bookingrate: Number(user?.bookingrate) || null,
          bookingrateunit: CompanionBookingUnitEnum.PERHOUR,
          description: user.description,
          Skintone: user.skintone,
          height: Number(user.height),
        };
        userdata['Companion'] = { create: companion };
      }
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
      });
      if (!isUserExists) {
        return { error: { status: 422, message: 'User not Exists' } };
      }
      const { userdata, locationdata, companiondata } =
        isvalidComanioninputs(userinputs);
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      if (allimages.length > 3) {
        return {
          error: { status: 422, message: 'Images more than 3 is not allowed' },
        };
      }
      const updateuser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userdata,
          Images: allimages,
          Companion: { update: { where: { userid: id }, data: companiondata } },
          location: { update: { where: { userid: id }, data: locationdata } },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error?.message || error);
      return { error: { status: 500, message: 'Something went wrong' } };
    }
  }
}
