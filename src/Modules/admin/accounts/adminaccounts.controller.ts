import { Controller, Get, HttpException } from '@nestjs/common';
import {
  AdminAccountsInnerRoute,
  AdminAccountsRoute,
} from '../routes/admin.routes';
import { AdminAccountsService } from './adminaccounts.service';
import { ApiControllerTag, ApiSuccessResponse } from 'src/swagger/decorators';
import { ApiOperation } from '@nestjs/swagger';
import { AdminResponseDto } from 'src/dto/admin.swagger.dto';


@ApiControllerTag('admin-adminaccounts')
@Controller(AdminAccountsRoute)
export class AdminAccountsController {
  constructor(private readonly adminaccountsservice: AdminAccountsService) {}

  @Get(AdminAccountsInnerRoute.getaccountstatementRoute)
  @ApiOperation({ summary: 'Get account statement' })
  @ApiSuccessResponse('Account statement retrieved successfully', AdminResponseDto)
  async getAccountStatementController() {
    const { data, error } =
      await this.adminaccountsservice.getAccountStatement();
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
