import { Injectable, Logger } from '@nestjs/common';
import { CompanionFindReturnDto } from 'src/dto/companionfind.dto';
import { PrismaService } from 'src/Services/prisma.service';

@Injectable()
export class CompanionFindService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CompanionFindService.name);

  async getFindCompanion(): Promise<CompanionFindReturnDto> {
    try {
      const data = await this.prismaService.user.findMany({
        where: { isCompanion: true },
        include: { location: { where: { city: 'Mumbai' } }, Companion: true },
      });
      return { data };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
