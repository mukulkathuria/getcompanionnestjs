import {
  Body,
  Controller,
  // FileTypeValidator,
  HttpCode,
  HttpException,
  // MaxFileSizeValidator,
  // ParseFilePipe,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  forgotPasswordDto,
  forgotPasswordInitDto,
  loginBodyDto,
  loginUserDto,
  logoutParamsDto,
  refreshTokenParamsDto,
  registerBodyDto,
} from 'src/dto/auth.module.dto';
import { controllerReturnDto } from 'src/dto/common.dto';
import { AuthGuard } from 'src/guards/jwt.guard';
import { AuthService } from './auth.service';
// import { AdminGuard } from 'src/guards/admin.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  UserImageMulterConfig,
  USERIMAGESMAXCOUNT,
} from 'src/config/multer.config';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', USERIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async registerController(
    @Body() userinfo: registerBodyDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    const { success, error } = await this.authService.registerUser(
      userinfo,
      images,
    );
    if (success) {
      return {
        success,
        message: 'User created successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('login')
  @HttpCode(200)
  async loginController(
    @Body() loginInfo: loginBodyDto,
  ): Promise<loginUserDto> {
    const { error, access_token, refresh_token } =
      await this.authService.getLogin(loginInfo);
    if (access_token && refresh_token) {
      return {
        success: true,
        access_token,
        refresh_token,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logoutUser(@Req() req: logoutParamsDto) {
    const { success, error } = await this.authService.getLogout(req);
    if (success) {
      return {
        success: true,
        messasge: 'User removed successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post('refreshtoken')
  @HttpCode(200)
  async getRefreshToken(@Body() token: refreshTokenParamsDto) {
    const { error, access_token } =
      await this.authService.getRefeshToken(token);
    if (access_token) {
      return {
        access_token,
        success: true,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: forgotPasswordInitDto) {
    const { error, success } = await this.authService.forgotPassword(dto);
    if (success) {
      return {
        success: true,
        message: 'Forgot password Link has been sent to your email.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: forgotPasswordDto) {
    const { error, success } = await this.authService.resetPassword(dto);
    if (success) {
      return {
        success: true,
        message: 'Password changed successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  // @Post('google/recaptcha/v3')
  // @HttpCode(200)
  // async verifyReCaptcha(@Body() token: any) {
  //   const { error, success, data } = await this.authService.verifyCaptcha(
  //     token,
  //   );
  //   if (success) {
  //     return {
  //       success: true,
  //       data,
  //       message: 'Captch verified',
  //     };
  //   } else {
  //     throw new HttpException(error.message, error.status);
  //   }
  // }
}
