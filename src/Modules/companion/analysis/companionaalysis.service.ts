import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/Services/prisma.service";
import { getearningofCompanionQuery } from "src/utils/companionanalysis.utils";


@Injectable()
export class CompanionAnalysisService {
      constructor(
        private readonly prismaService: PrismaService,
      ){}
        private readonly logger = new Logger(CompanionAnalysisService.name);

    async getCompanionOverallAnalysis(companionId: string) {
        try {
            if (!companionId || typeof companionId !== 'string') {
                return { error: { status: 422, message: 'companionId is required' } };
            }
            const rawQuery = getearningofCompanionQuery(companionId);
            const data = await this.prismaService.$queryRawUnsafe(rawQuery);
            return { data: data[0] || {} };
        } catch (error) {
            this.logger.error('Error in getCompanionOverallAnalysis:', error);
            return { error: { status: 500, message: 'Internal server error' } };
        }
    }
}