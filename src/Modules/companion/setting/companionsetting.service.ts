import { Injectable, Logger } from '@nestjs/common';
import { CompanionSettingDto } from 'src/dto/companionsetting.dto';
import { PrismaService } from 'src/Services/prisma.service';
import { validateCompanionSettingDto } from 'src/validations/companionsetting.validation';

@Injectable()
export class CompanionSettingService {
  constructor(private readonly prismaService: PrismaService) {}
  readonly logger = new Logger(CompanionSettingService.name);

  async getCompanionSetting(companionId: string) {
    try {
      const data = await this.prismaService.companion.findUnique({
        where: {
          userid: companionId,
        },
        select: {
          CompanionAvailability: {
            select: {
              isAvailable: true,
              startDate: true,
              endDate: true,
              availabletimeslot: {
                select: {
                  dayOfWeek: true,
                  startTime: true,
                  endTime: true,
                },
              },
            },
          },
        },
      });
      return { data };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return { error: 'Server Error', status: 500 };
    }
  }

  async updateCompanionSetting(
    companionId: string,
    companionSetting: CompanionSettingDto,
  ) {
    try {
      const { success, values, errors } =
        validateCompanionSettingDto(companionSetting);
      if (!success) {
        return { error: errors[0], status: 400 };
      }
      const availableslots = await this.prismaService.companion.findUnique({
        where: {
          userid: companionId,
        },
        select: {
          id: true,
          CompanionAvailability: {
            select: {
              id: true,
              availabletimeslot: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      if (availableslots.CompanionAvailability) {
        await this.prismaService.companionTimeSlot.deleteMany({
          where: {
            availabilityId: availableslots.CompanionAvailability.id,
          },
        });
      }
      const data = await this.prismaService.companion.update({
        where: {
          userid: companionId,
        },
        data: {
          CompanionAvailability: {
            upsert: {
              where: {
                companionId: availableslots.id,
              },
              update: {
                isAvailable: values.isAvailable,
                startDate: values.startDate,
                endDate: values.endDate,
                availabletimeslot: {
                  createMany: {
                    data: values.availabletimeslot,
                  },
                },
              },
              create: {
                isAvailable: values.isAvailable,
                startDate: values.startDate,
                endDate: values.endDate,
                availabletimeslot: {
                  createMany: {
                    data: values.availabletimeslot,
                  },
                },
              },
            },
          },
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return { error: 'Server Error', status: 500 };
    }
  }
}
