import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import { S3Service } from 'src/Services/s3.service';
import { successErrorReturnDto } from 'src/dto/common.dto';
// import { AccountEnum } from '@prisma/client';
import {
  CompanionUpdateRequestInputDto,
  UpdateUserProfileBodyDto,
  UserlocationProfileDto,
} from 'src/dto/user.dto';
import { getdeletedUserexpirydate } from 'src/utils/common.utils';
import { filterCompanionDetailsbyuser } from 'src/utils/user.utils';
import { validatecompanionupdaterequest } from 'src/validations/companionrequest.validation';
import { isvalidUserinputs } from 'src/validations/user.validations';
import { Request } from 'express';
import { validateUserAgentlocation } from 'src/validations/booking.validation';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsservice: S3Service,
  ) {}
  private readonly logger = new Logger(UsersService.name);

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
      // const allimages = images.map(
      //   (l) => process.env.DEFAULT_URL + l.destination + '/' + l.filename,
      // );
      const allimages = [];
      for (let i = 0; i < images.length; i += 1) {
        const filepath = 'userphotos/' + isUserExists.email + Date.now();
        const { data } = await this.awsservice.uploadFileins3(
          filepath,
          images[i].buffer,
          images[i].mimetype,
        );
        if (data) {
          allimages.push(data);
        }
      }
      // console.log(allimages);
      if (allimages.length > 1) {
        return {
          error: { status: 422, message: 'Images more than 1 is not allowed' },
        };
      }
      if (allimages.length) {
        userdata['Images'] = allimages;
      }
      const userDetails = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userdata,
        },
      });
      const sendData = {
        email: userDetails.email,
        role: userDetails?.role,
        name: userDetails?.firstname + ' ' + userDetails?.lastname,
        userId: userDetails?.id,
        isCompanion: Boolean(userDetails?.isCompanion),
        Images: userDetails.Images,
      };
      return { data: sendData };
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
                  googleformattedadress: true,
                  userinput: true,
                  googleplaceextra: true,
                  googleloc: true,
                },
              },
            },
          },
        },
      });
      if (!data) {
        return { error: { status: 422, message: 'Invalid companion search' } };
      }
      const values = {
        ...data,
        phoneno: String(data.phoneno),
        Companion: data.Companion.map((l) => ({
          ...l,
          baselocation: l.baselocation.map((p) => ({
            city: p.city,
            state: p.state,
            formattedaddress: p.googleformattedadress,
            name: p.googleloc,
            userInput: p.userinput,
            lat: p.lat,
            lng: p.lng,
            googleextra: p.googleplaceextra,
          })),
        })),
      };
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
      // const allimages = images.map(
      //   (l) => process.env.DEFAULT_URL + l.destination + '/' + l.filename,
      // );
      const allimages = [];
      for (let i = 0; i < images.length; i += 1) {
        const filepath = 'userphotos/companionewphoto' + userinfo.firstname + Date.now();
        const { data } = await this.awsservice.uploadFileins3(
          filepath,
          images[i].buffer,
          images[i].mimetype,
        );
        if (data) {
          allimages.push(data);
        }
      }
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
        user['Images'] = user.previousImages
          ? [...allimages, ...user.previousImages]
          : allimages;
      } else {
        user['Images'] = user.previousImages;
      }
      delete user.previousImages;
      await this.prismaService.companionupdaterequest.create({
        data: {
          ...user,
          baselocations: { createMany: { data: user.baselocations } },
          companiondetails: { connect: { id: userId } },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getUserOtherDetails(
    req: Request,
    bodyParams: UserlocationProfileDto,
    userId: string,
  ): Promise<successErrorReturnDto> {
    try {
      const { error } = validateUserAgentlocation(bodyParams);
      if (error) {
        return { error };
      }
      const { getUserAgentDetails, isEqualObject } = await import(
        '../../../utils/userAgent.utils'
      );
      const userdata = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          companionsearchlocations: {
            orderBy: { createdAt: 'desc' },
            select: {
              lat: true,
              lng: true,
              state: true,
              city: true,
              userAgent: true,
            },
          },
        },
      });
      if (!userdata) {
        return { error: { status: 422, message: 'No User is exists' } };
      }
      const userAgent = getUserAgentDetails(
        req.headers['user-agent'],
      ) as unknown as { [key: string]: string };
      let isNewAgent = !Boolean(userdata.companionsearchlocations.length);
      for (let i = 0; i < userdata.companionsearchlocations.length; i += 1) {
        const values = userdata.companionsearchlocations[i];
        if (
          values.city !== bodyParams.city ||
          values.state !== bodyParams.state ||
          values.lat !== bodyParams.lat ||
          values.lng !== bodyParams.lng ||
          !isEqualObject(values.userAgent as object, userAgent)
        ) {
          isNewAgent = true;
        }
      }
      if (isNewAgent) {
        await this.prismaService.companionsearchlocations.create({
          data: {
            ...bodyParams,
            userAgent,
            remoteAddress: req.socket.remoteAddress,
            User: { connect: { id: userId } },
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
