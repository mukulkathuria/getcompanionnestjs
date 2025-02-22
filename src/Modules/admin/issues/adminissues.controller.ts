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
import { AdminIssuesServices } from './adminissues.service';
import {
  AdminIssuesInnerRoutes,
  AdminIssuesRoute,
} from '../routes/admin.routes';
import { AdminGuard } from 'src/guards/admin.guard';
import {
  addCommentonIssueInputDto,
  createIssueInputDto,
  getIssueDetailsQueryDto,
} from 'src/dto/userissues.dto';
import { FileSizeValidationPipe } from 'src/multer/multer.filesizevalidator';
import {
  USERISSUEIMAGESMAXCOUNT,
  UserIssuesImageMulterConfig,
} from 'src/config/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller(AdminIssuesRoute)
export class AdminIssuesController {
  constructor(private readonly adminissuesservices: AdminIssuesServices) {}

  @UseGuards(AdminGuard)
  @Get()
  async getAllActiveIssuesforAdmin() {
    const { data, error } = await this.adminissuesservices.getAllActiveIssues();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Post(AdminIssuesInnerRoutes.createNewIssueRoute)
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
    @Req() req: Request
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if(data){
      const { success, error } = await this.adminissuesservices.createUserIssue(
        issueinfo,
        images,
        data.userId
      );
      if (success) {
        return {
          success,
        };
      } else {
        throw new HttpException(error.message, error.status);
      }
    }else {
      throw new HttpException(TokenError || 'Server Error', 403);
    }
  }

  @UseGuards(AdminGuard)
  @Get(AdminIssuesInnerRoutes.getIssueDetailsRoute)
  async getIssueDetailsContoller(
    @Query() issueIdQuery: getIssueDetailsQueryDto,
  ) {
    const { data, error } =
      await this.adminissuesservices.getIssueDetails(issueIdQuery);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AdminGuard)
  @Post(AdminIssuesInnerRoutes.addcommentonIssueRoute)
  async addCommentonIssueController(
    @Body() commentIput: addCommentonIssueInputDto,
    @Req() req: Request
  ) {
    const { decodeExpressRequest } = await import(
      '../../../guards/strategies/jwt.strategy'
    );
    const { data, error: TokenError } = decodeExpressRequest(req);
    if (data) {
      const { success, error } =
        await this.adminissuesservices.addCommentonIssue(
          commentIput,
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
}
