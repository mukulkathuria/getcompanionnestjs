import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import { successErrorReturnDto } from 'src/dto/common.dto';
// import { AccountEnum } from '@prisma/client';
import {
  CompanionUpdateRequestInputDto,
  UpdateUserProfileBodyDto,
} from 'src/dto/user.dto';
import { getdeletedUserexpirydate } from 'src/utils/common.utils';
import { filterCompanionDetailsbyuser } from 'src/utils/user.utils';
import { validatecompanionupdaterequest } from 'src/validations/companionrequest.validation';
import { isvalidUserinputs } from 'src/validations/user.validations';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(PrismaService.name);

  async deleteUser(userId: string): Promise<successErrorReturnDto> {
    try {
      // eslint-disable-next-line
      const updateUser = await this.prismaService.user.update({
        where: { id: userId },
        data: { isDeleted: true, expiryDate: getdeletedUserexpirydate() },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
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
      const { userdata } = isvalidUserinputs(userinputs);
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      if (allimages.length > 1) {
        return {
          error: { status: 422, message: 'Images more than 1 is not allowed' },
        };
      }
      // eslint-disable-next-line
      const updateuser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userdata,
          Images: allimages,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getCompanionDetails(companionId: string) {
    try {
      if (!companionId || typeof companionId !== 'string') {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const data = await this.prismaService.user.findUnique({
        where: { id: companionId },
        include: { Companion: true },
      });
      if (!data) {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const finaldata = filterCompanionDetailsbyuser(data.Companion[0], data);
      return { data: finaldata };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getUserDetails(userId: string) {
    try {
      if (!userId || typeof userId !== 'string') {
        return { error: { status: 422, message: 'Invalid user search' } };
      }
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          firstname: true,
          lastname: true,
          age: true,
          gender: true,
          Images: true,
          phoneno: true,
          email: true,
          id: true,
        },
      });
      if (!data) {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const filtered = { ...data, phoneno: String(data.phoneno) };
      // const finaldata = filterCompanionDetailsbyuser(data.Companion[0], data);
      return { data: filtered };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getfullCompanionDetails(userId: string) {
    try {
      if (!userId || typeof userId !== 'string') {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const data = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          phoneno: true,
          email: true,
          Images: true,
          age: true,
          firstname: true,
          lastname: true,
          gender: true,
          Companion: {
            select: {
              id: true,
              bookingrateunit: true,
              description: true,
              Skintone: true,
              height: true,
              bodytype: true,
              eatinghabits: true,
              drinkinghabits: true,
              smokinghabits: true,
              baselocation: {
                select: {
                  city: true,
                  state: true,
                  lat: true,
                  lng: true,
                },
              },
            },
          },
        },
      });
      if (!data) {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const values = { ...data, phoneno: String(data.phoneno) };
      return { data: values };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async updatecompanionrequest(
    userinfo: CompanionUpdateRequestInputDto,
    images: Express.Multer.File[],
    userId: string,
  ) {
    try {
      const { user, error } = validatecompanionupdaterequest(userinfo);
      if (error) {
        return { error };
      }
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      if (!userinfo.previousImages && allimages.length < 2) {
        return {
          error: { status: 422, message: 'Images is required' },
        };
      } else if (
        userinfo?.previousImages?.length + allimages.length < 2 ||
        userinfo?.previousImages?.length + allimages.length > 4
      ) {
        return {
          error: { status: 422, message: 'Images should be between 2 and 4' },
        };
      }
      if (allimages.length >= 1) {
        user['Images'] = userinfo?.previousImages
          ? [...allimages, ...userinfo.previousImages]
          : allimages;
      }
      await this.prismaService.companionupdaterequest.create({
        data: {
          ...user,
          companiondetails: { connect: { id: userId } },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
