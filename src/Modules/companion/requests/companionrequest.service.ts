import { Injectable, Logger } from '@nestjs/common';
import { successErrorDto } from 'src/dto/common.dto';
import { GenderEnum, registercompanionInputDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { S3Service } from 'src/Services/s3.service';
import { validateCompanionRequestInput } from 'src/validations/companionrequest.validation';

@Injectable()
export class CompanionRequestService {
  constructor(private readonly prismaService: PrismaService,
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
      // const allimages = images.map((l) => process.env.DEFAULT_URL + l.destination + '/' + l.filename);
      const allimages = [];
      for (let i = 0; i < images.length; i += 1) {
        const filepath = 'companionrequest/' + userinfo.email + Date.now();
        const { data } = await this.awsservice.uploadFileins3(
          filepath,
          images[i].buffer,
          images[i].mimetype,
        );
        if (data) {
          allimages.push(data);
        }
      }
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
      return { success: true }
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
