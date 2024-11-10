import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleService {
  private readonly client: OAuth2Client;
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async verifyGoogleToken(token: string) {
    try {
      const payload = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const data = payload.getPayload();
      return { data };
    } catch (error) {
      return {
        error: {
          status: 500,
          message: error?.message || 'Server error',
        },
      };
    }
  }
}
