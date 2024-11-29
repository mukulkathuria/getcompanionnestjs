import { Injectable, Logger } from '@nestjs/common';
import {
  CompanionFindReturnDto,
  userCompanionFindLocationInputDto,
} from 'src/dto/companionfind.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { sortCompanion } from 'src/utils/common.utils';
import { validateCompanionSearch } from 'src/validations/user.validations';

@Injectable()
export class CompanionFindService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(CompanionFindService.name);

  async getFindCompanion(
    userLocation: userCompanionFindLocationInputDto,
  ): Promise<CompanionFindReturnDto> {
    try {
      const { data, error } = validateCompanionSearch(userLocation);
      if (error) {
        return { error };
      }
      const userdata = (await this.prismaService.user.findMany(data));
      if (userdata && userdata.length) {
        const companions = userdata.map((l) => l.Companion[0]).filter((l) => l);
        const companionplaces = companions.length
          ? companions.map((l) => ({
              id: l.id,
              lat: l.baselocation[0].lat,
              lng: l.baselocation[0].lng,
              companiondata: l,
            }))
          : [];
        const sortedCompanions = companionplaces.length
          ? sortCompanion(userLocation, companionplaces)
          : [];
        return { data: sortedCompanions };
      }
      return { data: [] };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
