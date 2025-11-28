import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Services/prisma.service';
import { getCompanionDashboardQuery } from 'src/utils/companionanalysis.utils';

@Injectable()
export class CompanionDashboardService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CompanionDashboardService.name);

  async getCompanionDashboard(companionId: string) {
    try {
      const query = getCompanionDashboardQuery(companionId);
      const data = await this.prismaService.$queryRawUnsafe(query);
      return { data };
    } catch (error) {
      this.logger.error(error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }
}
