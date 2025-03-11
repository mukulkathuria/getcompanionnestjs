import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { tokenInputDto } from 'src/dto/auth.module.dto';

@Injectable()
export class GoogleService {
  private readonly client: OAuth2Client;
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT
    );
  }

  async verifyGoogleToken(tokenInput: tokenInputDto) {
    try {
      const idToken = await this.client.getToken(tokenInput.token)
      const payload = await this.client.verifyIdToken({
        idToken: idToken.tokens.id_token,
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
