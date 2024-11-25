import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CompanionRequestInnerRoutes } from '../routes/companion.routes';
import { CompanionRequestService } from './companionrequest.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  UserImageMulterConfig,
  USERIMAGESMAXCOUNT,
} from 'src/config/multer.config';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import { registercompanionInputDto } from 'src/dto/user.dto';
import { controllerReturnDto } from 'src/dto/common.dto';

@Controller(CompanionRequestInnerRoutes.baseUrl)
export class CompanionRequestCotroller {
  constructor(
    private readonly companionrequestservice: CompanionRequestService,
  ) {}

  @Post(CompanionRequestInnerRoutes.requestforcompanion)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', USERIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async requestforCompanionController(
    @Body() userinfo: registercompanionInputDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    const { success, error } =
      await this.companionrequestservice.requestforcompanion(userinfo, images);
    if (success) {
      return {
        success,
        message: 'User created successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
