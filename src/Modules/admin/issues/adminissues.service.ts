import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class AdminIssuesServices {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(AdminIssuesServices.name);

  async getAllActiveIssues() {
    try {
      const data = await this.prismaService.userissues.findMany({
        where: { status: 'ACTIVE' },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getIssueDetails() {
    try {
      const data = await this.prismaService.userissues.findMany({
        where: { id: 'abc' },
        include: { comments: true },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async createUserIssue() {
    try {
      const data = await this.prismaService.userissues.create({
        data: {
          screenshots: ['/abc'],
          explanation: 'My first explanation',
          subject: 'My first subject',
          User: { connect: { id: 'abc' } },
        },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
