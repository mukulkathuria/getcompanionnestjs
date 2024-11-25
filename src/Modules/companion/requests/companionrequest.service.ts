import { Injectable, Logger } from '@nestjs/common';
import { successErrorDto } from 'src/dto/common.dto';
import { GenderEnum, registercompanionInputDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { validateCompanionRequestInput } from 'src/validations/companionrequest.validation';

@Injectable()
export class CompanionRequestService {
  constructor(private readonly prismaService: PrismaService) {}
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
      const isUserExists =
        await this.prismaService.user.findUnique({
          where: { email: userinfo.email },
        });
      if (isUserExists) {
        return { error: { status: 422, message: 'Email Already exists' } };
      }
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      const userdata = {
        firstname: userinfo.firstname,
        lastname: userinfo.lastname,
        email: userinfo.email,
        gender: GenderEnum[userinfo.gender],
        age: Number(userinfo.age),
        Images: [...allimages],
        phoneNo: Number(userinfo.phoneno)
      };
      await this.prismaService.companionrequests.create({ data: userdata })
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
