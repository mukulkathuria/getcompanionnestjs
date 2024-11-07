import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { AdminIssuesServices } from './adminissues.service';
import { AdminIssuesRoute } from '../routes/admin.routes';
import { AdminGuard } from 'src/guards/admin.guard';

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
}
