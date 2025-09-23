import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserIssuesInnerRoutes, UserIssuesRoute } from '../routes/user.routes';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserIssuesServices } from './userissues.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  USERISSUEIMAGESMAXCOUNT,
  UserIssuesImageMulterConfig,
} from 'src/config/multer.config';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import {
  addCommentonIssueInputDto,
  createIssueInputDto,
  getIssueDetailsQueryDto,
} from 'src/dto/userissues.dto';
import { ApiControllerTag } from 'src/swagger/decorators';


@ApiControllerTag('user-userissues')
@Controller(UserIssuesRoute)
export class UserIssuesController {
  constructor(private readonly userissuesservices: UserIssuesServices) {}

  @UseGuards(AuthGuard)
  @Get(UserIssuesInnerRoutes.getAllActiveIssuesRoute)
  async getAllActiveUserIssue(@Req() req: Request) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data: TokenData, error: TokenError } = decodeExpressRequest(req);
    if (TokenData) {
      const { data, error } = await this.userissuesservices.getAllActiveIssues(
        TokenData.userId,
      );
      if (data) {
        return {
          data,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException('Server Error', 500);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserIssuesInnerRoutes.createNewIssueRoute)
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor(
      'images',
      USERISSUEIMAGESMAXCOUNT,
      UserIssuesImageMulterConfig,
    ),
  )
  async createUserIssueController(
    @Body() issueinfo: createIssueInputDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if (data) {
      const { success, error } = await this.userissuesservices.createUserIssue(
        issueinfo,
        images,
        data.userId,
      );
      if (success) {
        return {
          success,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException(TokenError || 'Server Error', 403);
    }
  }

  @UseGuards(AuthGuard)
  @Get(UserIssuesInnerRoutes.getIssueDetailsRoute)
  async getIssueDetailsContoller(
    @Query() issueIdQuery: getIssueDetailsQueryDto,
  ) {
    const { data, error } =
      await this.userissuesservices.getIssueDetails(issueIdQuery);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AuthGuard)
  @Post(UserIssuesInnerRoutes.addcommentonIssueRoute)
  @UseInterceptors(
    FilesInterceptor(
      'images',
      USERISSUEIMAGESMAXCOUNT,
      UserIssuesImageMulterConfig,
    ),
  )
  async addCommentonIssueController(
    @Body() commentIput: addCommentonIssueInputDto,
    @UploadedFiles(new FileSizeValidationPipe())
    images: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if (data) {
      const { success, error } =
        await this.userissuesservices.addCommentonIssue(
          commentIput,
          data.userId,
          images
        );
      if (success) {
        return {
          success,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    } else {
      throw new HttpException(TokenError || 'Server Error', 403);
    }
  }
}
