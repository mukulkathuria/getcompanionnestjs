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
  COMPANIONIMAGESMAXCOUNT,
  COMPANIONREQUESTMAXCOUNT,
  RequestCompanionImageMulterConfig,
  UserImageMulterConfig,

} from 'src/config/multer.config';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import { registercompanionInputDto } from 'src/dto/user.dto';
import { controllerReturnDto } from 'src/dto/common.dto';
import { registerCompanionBodyDto } from 'src/dto/auth.module.dto';

@Controller(CompanionRequestInnerRoutes.baseUrl)
export class CompanionRequestCotroller {
  constructor(
    private readonly companionrequestservice: CompanionRequestService,
  ) {}

  @Post(CompanionRequestInnerRoutes.requestforcompanion)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', COMPANIONREQUESTMAXCOUNT, RequestCompanionImageMulterConfig),
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

    @Post(CompanionRequestInnerRoutes.registeracompanion)
    @HttpCode(200)
    @UseInterceptors(
      FilesInterceptor('images', COMPANIONIMAGESMAXCOUNT, UserImageMulterConfig),
    )
    async registerCompanionController(
      @Body() userinfo: registerCompanionBodyDto,
      @UploadedFiles(new FileSizeValidationPipe())
      images: Express.Multer.File[],
    ): Promise<controllerReturnDto> {
      const { success, error } = await this.companionrequestservice.registerCompanion(
        userinfo,
        images,
      );
      if (success) {
        return {
          success,
          message: 'Companion created successfully.',
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    }
}
