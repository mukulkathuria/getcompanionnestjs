import { Injectable, Logger } from '@nestjs/common';
import { pageNoQueryDto } from 'src/dto/bookings.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { getearningofCompanionQuery } from 'src/utils/companionanalysis.utils';

@Injectable()
export class CompanionAnalysisService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CompanionAnalysisService.name);

  async getCompanionOverallAnalysis(companionId: string) {
    try {
      const rawQuery = getearningofCompanionQuery(companionId);
      const data = await this.prismaService.$queryRawUnsafe(rawQuery);
      return { data: data[0] || {} };
    } catch (error) {
      this.logger.error('Error in getCompanionOverallAnalysis:', error);
      return { error: { status: 500, message: 'Internal server error' } };
    }
  }

  async getallcompanioncompletedearnings(
    companionId: string,
    params: pageNoQueryDto,
  ) {
    try {
      const pageNo = Number(params.pageNo) || 1;
      const limit = 10;
      const [items, aggregateResult] = await this.prismaService.$transaction([
        this.prismaService.transactionLedger.findMany({
          where: {
            toCompanionId: companionId,
            status: 'COMPLETED',
          },
          skip: (pageNo - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.transactionLedger.aggregate({
          where: {
            toCompanionId: companionId,
            status: 'COMPLETED',
          },
          _count: {
            id: true,
          },
        }),
      ]);
      const totalCount = aggregateResult._count.id;
      const totalPages = Math.ceil(totalCount / limit);
      const finalvalue = {
        totalPages,
        limit,
        currentPage: pageNo,
        earnings: items,
      };
      return { data: finalvalue };
    } catch (error) {
      this.logger.error('Error in getallcompanioncompletedearnings:', error);
      return { error: { status: 500, message: 'Internal server error' } };
    }
  }

  async getallcompanionpendingearnings(
    companionId: string,
    params: pageNoQueryDto,
  ) {
    try {
      const pageNo = Number(params.pageNo) || 1;
      const limit = 10;
      const [items, aggregateResult] = await this.prismaService.$transaction([
        this.prismaService.transactionLedger.findMany({
          where: {
            toCompanionId: companionId,
            status: 'UNDERPROCESSED',
          },
          skip: (pageNo - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.transactionLedger.aggregate({
          where: {
            toCompanionId: companionId,
            status: 'UNDERPROCESSED',
          },
          _count: {
            id: true,
          },
        }),
      ]);
      const totalCount = aggregateResult._count.id;
      const totalPages = Math.ceil(totalCount / limit);
      const finalvalue = {
        totalPages,
        limit,
        currentPage: pageNo,
        earnings: items,
      };
      return { data: finalvalue };
    } catch (error) {
      this.logger.error('Error in getallcompanioncompletedearnings:', error);
      return { error: { status: 500, message: 'Internal server error' } };
    }
  }
}
