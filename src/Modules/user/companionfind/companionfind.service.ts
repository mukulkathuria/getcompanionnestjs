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

  async getFindCompanion(userLocation: userCompanionFindLocationInputDto) {
    try {
      const { data, error } = validateCompanionSearch(userLocation);
      if (error) {
        return { error };
      }
      const userdata = await this.prismaService.user.findMany(data);
      if (userdata && userdata.length) {
        const companions = userdata
          .map((l) => ({
            ...l.Companion[0],
            firstname: l.firstname,
            images: l.Images,
          }))
          .filter((l) => l && l?.baselocation?.length);
        const baselocations = companions.every((l) => l.baselocation.length);
        const companionplaces =
          companions.length && baselocations
            ? companions.map((l) => ({
                id: l.id,
                lat: l.baselocation[0].lat,
                lng: l.baselocation[0].lng,
                companiondata: l,
                images: l.images,
                firstname: l.firstname
              }))
            : [];
        const sortedCompanions = companionplaces.length
          ? sortCompanion(userLocation, companionplaces)
          : [];
        const filteredData = sortedCompanions.map((l) => ({
          bookingrate: l.bookingrate,
          userId: l.userid,
          bookingrateunit: l.bookingrate,
          distance: l.distance,
          images: l.images,
          firstname: l.firstname
        }));
        return { data: filteredData };
      }
      return { data: [] };
    } catch (error) {
      console.log(error);
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
