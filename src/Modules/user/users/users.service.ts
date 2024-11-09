import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import { successErrorReturnDto } from 'src/dto/common.dto';
// import { AccountEnum } from '@prisma/client';
import { UpdateUserProfileBodyDto } from 'src/dto/user.dto';
import { getdeletedUserexpirydate } from 'src/utils/common.utils';
import { filterCompanionDetailsbyuser } from 'src/utils/user.utils';
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
}
