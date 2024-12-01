import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  COMPANIONIMAGESMAXCOUNT,
  UserImageMulterConfig,
} from 'src/config/multer.config';
import { controllerReturnDto } from 'src/dto/common.dto';
import {
  UpdateUserProfileBodyDto,
  UserProfileParamsDto,
} from 'src/dto/user.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import { CompanionService } from './companion.service';
import { AdminUserProfileRoute } from '../routes/admin.routes';
import { registerCompanionBodyDto } from 'src/dto/auth.module.dto';

@Controller(AdminUserProfileRoute)
export class CompanionController {
  constructor(private readonly companionservice: CompanionService) {}

  @UseGuards(AdminGuard)
  @Post('registercompanion')
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', COMPANIONIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async registerCompanionController(
    @Body() userinfo: registerCompanionBodyDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    const { success, error } = await this.companionservice.registerCompanion(
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

  @UseGuards(AdminGuard)
  @Post('updatecompanionprofile/:id')
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', COMPANIONIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async userupdatecompanionprofileController(
    @Param() id: UserProfileParamsDto,
    @Body() userinfo: UpdateUserProfileBodyDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    if (!id.id || typeof id.id !== 'string') {
      throw new HttpException('Invalid User', 422);
    }
    const { success, error } = await this.companionservice.updateUserProfile(
      userinfo,
      images,
      id.id,
    );
    if (success) {
      return {
        success,
        message: 'User Updated successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
