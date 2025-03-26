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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserprofileInnerRoute, UserProfileRoute } from '../routes/user.routes';
import { UsersService } from './users.service';
import {
  COMPANIONIMAGESMAXCOUNT,
  UserImageMulterConfig,
  USERIMAGESMAXCOUNT,
} from 'src/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { controllerReturnDto } from 'src/dto/common.dto';
import {
  CompanionUpdateRequestInputDto,
  UpdateUserProfileBodyDto,
  UserlocationProfileDto,
  UserProfileParamsDto,
} from 'src/dto/user.dto';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import { companionDetailsQuery } from 'src/dto/companionfind.dto';
import { Request as ExpressRquest } from 'express';

@Controller(UserProfileRoute)
export class DeleteUsersController {
  constructor(private readonly userservice: UsersService) {}

  @UseGuards(AuthGuard)
  @Delete(UserprofileInnerRoute.deleteuser)
  async deleteUsersController(@Query() userId: string) {
    const { error, success, message } =
      await this.userservice.deleteUser(userId);
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
  ) {
    if (!id.id || typeof id.id !== 'string') {
      throw new HttpException('Invalid User', 422);
    }
    const { data, error } = await this.userservice.updateUserProfile(
      userinfo,
      images,
      id.id,
    );
    if (data) {
      return {
        data,
        message: 'User Updated successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserprofileInnerRoute.usertocompaniondetails)
  async getCompanionDetails(@Query() companionDetails: companionDetailsQuery) {
    const { error, data } = await this.userservice.getCompanionDetails(
      companionDetails.companionId,
    );
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserprofileInnerRoute.userProfileDetails)
  async getUserDetails(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { error, data } = await this.userservice.getUserDetails(
        Tokendata.userId,
      );
      if (data) {
        return {
          data,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else if (TokenError) {
      throw new HttpException(TokenError, 403);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserprofileInnerRoute.getcompanionfulldetails)
  async getCompanionFullDetailsController(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(req);
    if (Tokendata) {
      const { error, data } = await this.userservice.getfullCompanionDetails(
        Tokendata.userId,
      );
      if (data) {
        return {
          data,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else if (TokenError) {
      throw new HttpException(TokenError, 403);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserprofileInnerRoute.updatecompanionrequest)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('images', COMPANIONIMAGESMAXCOUNT, UserImageMulterConfig),
  )
  async companionupdaterequestController(
    @Param() id: UserProfileParamsDto,
    @Body() userinfo: CompanionUpdateRequestInputDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
  ): Promise<controllerReturnDto> {
    if (!id.id || typeof id.id !== 'string') {
      throw new HttpException('Invalid User', 422);
    }
    const { success, error } = await this.userservice.updatecompanionrequest(
      userinfo,
      images,
      id.id,
    );
    if (success) {
      return {
        success,
        message: 'Companion request successfully.',
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserprofileInnerRoute.getuserotherdetailsroute)
  async getUserOtherDeialsController(
    @Req() req: ExpressRquest,
    @Body() bodyparams: UserlocationProfileDto,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: Tokendata, error: TokenError } = decodeExpressRequest(
      req as unknown as Request,
    );
    if (Tokendata) {
      const { success, error } = await this.userservice.getUserOtherDetails(
        req,
        bodyparams,
        Tokendata.userId,
      );
      if (success) {
        return {
          success,
          message: 'Successfully updated details',
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException(TokenError, 403);
    }
  }
}
