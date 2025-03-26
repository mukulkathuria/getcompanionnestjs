import { Controller, Get } from '@nestjs/common';
import {
  AdminDeveloperInnerRoute,
  AdminDeveloperRoute,
} from '../routes/admin.routes';
import { DevelopmentService } from './development.service';

@Controller(AdminDeveloperRoute)
export class DevelopmentController {
  constructor(private readonly developerservice: DevelopmentService) {}

  @Get(AdminDeveloperInnerRoute.getotplist)
  async getotpcontroller() {
    return await this.developerservice.getOTPList();
  }
}
