import { Controller, Get, HttpException, Query, UseGuards } from '@nestjs/common';
import { UserCompanionFindRoute } from '../routes/user.routes';
import { CompanionFindService } from './companionfind.service';
import { CompanionFindReturnDto, userCompanionFindLocationInputDto } from 'src/dto/companionfind.dto';
import { AuthGuard } from 'src/guards/jwt.guard';

@Controller(UserCompanionFindRoute)
export class CompanionFindController {
  constructor(private readonly companionfindservice: CompanionFindService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getCompanionFindController(@Query() userDetails: userCompanionFindLocationInputDto): Promise<CompanionFindReturnDto> {
    const { data, error } =
      await this.companionfindservice.getFindCompanion(userDetails);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
