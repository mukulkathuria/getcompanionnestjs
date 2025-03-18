import { Controller, Get, HttpException } from '@nestjs/common';
import {
  AdminAccountsInnerRoute,
  AdminAccountsRoute,
} from '../routes/admin.routes';
import { AdminAccountsService } from './adminaccounts.service';

@Controller(AdminAccountsRoute)
export class AdminAccountsController {
  constructor(private readonly adminaccountsservice: AdminAccountsService) {}

  @Get(AdminAccountsInnerRoute.getaccountstatementRoute)
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
