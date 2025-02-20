import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
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
  UpdateCompanionProfileBodyDto,
  UserProfileParamsDto,
} from 'src/dto/user.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import { CompanionService } from './companion.service';
import {
  AdminCompanionInnerRoutes,
  AdminUserProfileRoute,
} from '../routes/admin.routes';
import { registerCompanionBodyDto } from 'src/dto/auth.module.dto';

@Controller(AdminUserProfileRoute)
export class CompanionController {
  constructor(private readonly companionservice: CompanionService) {}

  @UseGuards(AdminGuard)
  @Post(AdminCompanionInnerRoutes.registercompanionroute)
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
  @Post(AdminCompanionInnerRoutes.updatecompanionprofileroute)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', COMPANIONIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async userupdatecompanionprofileController(
    @Param() id: UserProfileParamsDto,
    @Body() userinfo: UpdateCompanionProfileBodyDto,
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
        message: 'Companion Updated successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminCompanionInnerRoutes.getcompanionupdaterequestlistroute)
  async getUpdateCompanionRequest() {
    const { data, error } =
      await this.companionservice.getUpdateCompanionList();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminCompanionInnerRoutes.getupdatecompaniondetailsroute)
  async getUpdateCompanionRequestDetails(@Query() id: UserProfileParamsDto) {
    if (!id.id || typeof id.id !== 'string') {
      throw new HttpException('Invalid User', 422);
    }
    const { data, error } =
      await this.companionservice.getUpdateCompanionDetails(Number(id.id));
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Post(AdminCompanionInnerRoutes.updatecompaniondetailsroute)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', COMPANIONIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async updatecompanionDetailsController(
    @Param() id: UserProfileParamsDto,
    @Body() userinfo: registerCompanionBodyDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    if (!id.id || typeof id.id !== 'string') {
      throw new HttpException('Invalid User', 422);
    }
    const { success, error } =
      await this.companionservice.updateCompanionDetails(
        userinfo,
        images,
        id.id,
      );
    if (success) {
      return {
        success,
        message: 'Companion Updated successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
