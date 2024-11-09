import {
  Body,
  Controller,
  Delete,
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
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserprofileInnerRoute, UserProfileRoute } from '../routes/user.routes';
import { UsersService } from './users.service';
import {
  UserImageMulterConfig,
  USERIMAGESMAXCOUNT,
} from 'src/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { controllerReturnDto } from 'src/dto/common.dto';
import {
  UpdateUserProfileBodyDto,
  UserProfileParamsDto,
} from 'src/dto/user.dto';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';

@Controller(UserProfileRoute)
export class DeleteUsersController {
  constructor(private readonly userservice: UsersService) {}

  @UseGuards(AuthGuard)
  @Delete(UserprofileInnerRoute.deleteuser)
  async deleteUsersController(@Query() userId: string) {
    const { error, success, message } = await this.userservice.deleteUser(userId);
    if (success) {
      return {
        success: success,
        message: message,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserprofileInnerRoute.updateprofile)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', USERIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async userupdateprofileController(
    @Param() id: UserProfileParamsDto,
    @Body() userinfo: UpdateUserProfileBodyDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    if (!id.id || typeof id.id !== 'string') {
      throw new HttpException('Invalid User', 422);
    }
    const { success, error } = await this.userservice.updateUserProfile(
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

  @UseGuards(AuthGuard)
  @Get(UserprofileInnerRoute.usertocompaniondetails)
  async getCompanionDetails(@Query() companionId: string) {
    const { error, data } =
      await this.userservice.getCompanionDetails(companionId);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
