import { Controller, Get, HttpException, Query, UseGuards } from '@nestjs/common';
import { UserIssuesRoute } from '../routes/user.routes';
import { AuthGuard } from 'src/guards/jwt.guard';
import { UserIssuesServices } from './userissues.service';

@Controller(UserIssuesRoute)
export class UserIssuesController {
  constructor(private readonly userissuesservices: UserIssuesServices) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllActiveUserIssue(
    @Query() userId: string
  ) {
    const { data, error } = await this.userissuesservices.getAllActiveIssues(userId);
    if (data) {
      return {
        data,
      };
    } else {
      throw new HttpException(error.message, error.status);
    }
  }
}
