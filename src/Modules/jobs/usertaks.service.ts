import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserTasksService {
  private readonly logger = new Logger(UserTasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteUserandrefreshtoken() {
    try {
      const { unlinkSync, readdirSync } = await import('fs');
      const allfiles = readdirSync('UserPhotos');
      for (let i = 0; i < allfiles.length; i += 1) {
        const filePath = `UserPhotos/${allfiles[i]}`;
        unlinkSync(filePath);
      }
      const { Jwt } = await import('../../tokens/Jwt');
      for (let i = 0; i < Object.keys(Jwt.refreshTokens).length; i += 1) {
        Jwt.removeExpiredToken(Jwt.refreshTokens[i]);
      }
      const { OTPData } = await import('../../Cache/OTP');
      for (let i = 0; i < Object.keys(OTPData.data).length; i += 1) {
        OTPData.removeExpiredData(OTPData.data[i]);
      }
      this.logger.log('UserPhotos deleted successfully');
      return { success: true };
    } catch (error) {
      this.logger.debug(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
}
