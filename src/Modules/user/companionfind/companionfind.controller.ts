import { Controller, Get, HttpException } from '@nestjs/common';
import { UserCompanionFindRoute } from '../routes/user.routes';
import { CompanionFindService } from './companionfind.service';
import { CompanionFindReturnDto } from 'src/dto/companionfind.dto';

@Controller(UserCompanionFindRoute)
export class CompanionFindController {
  constructor(private readonly companionfindservice: CompanionFindService) {}

  @Get()
  async getCompanionFindController(): Promise<CompanionFindReturnDto> {
    const { data, error } =
      await this.companionfindservice.getFindCompanion();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
