import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpException,
  Param,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserDelete, UserProfileRoute } from '../routes/user.routes';
import { UsersService } from './users.service';
import {
  UserImageMulterConfig,
  USERIMAGESMAXCOUNT,
} from 'src/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { controllerReturnDto } from 'src/dto/common.dto';
import { UpdateUserProfileBodyDto, UserProfileParamsDto } from 'src/dto/user.dto';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller(UserProfileRoute)
export class DeleteUsersController {
  constructor(private readonly userservice: UsersService) {}

  @UseGuards(AuthGuard)
  @Post(UserDelete)
  async deleteUsersController() {
    const { error, success, message } = await this.userservice.deleteUser();
    if (success) {
      return {
        success: success,
        message: message,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('updateprofile/:id')
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
      id.id
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

  @UseGuards(AdminGuard)
  @Post('updatecompanionprofile/:id')
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', USERIMAGESMAXCOUNT, UserImageMulterConfig),
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
    const { success, error } = await this.userservice.updateUserProfile(
      userinfo,
      images,
      id.id
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
