import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { EMAILURL } from 'src/constants/common.constants';
import { sign } from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import {
  accessTokenConfig,
  AccessTokenSecret,
  refreshTokenConfig,
  RefreshTokenSecret,
} from 'src/config/jwt.config';
import {
  AccountEnum,
  forgotPasswordDto,
  forgotPasswordInitDto,
  loginBodyDto,
  loginUserDto,
  logoutParamsDto,
  refreshTokenParamsDto,
  registerBodyDto,
  Roles,
} from 'src/dto/auth.module.dto';
import { successErrorDto } from 'src/dto/common.dto';
import { authTokenDto } from 'src/dto/tokens.dto';
import {
  decodeRefreshToken,
  validateToken,
} from 'src/guards/strategies/jwt.strategy';
import { PrismaService } from 'src/Services/prisma.service';
import { Jwt } from 'src/tokens/Jwt';
import { decrypt, encrypt, encryptRefreshToken } from 'src/utils/crypt.utils';
import { uuid } from 'src/utils/uuid.utils';
import {
  refreshTokenValidate,
  validateLoginUser,
  validateregisterUser,
} from 'src/validations/auth.validation';
import { OAuth2Client } from 'google-auth-library';
import { getdefaultexpirydate } from 'src/utils/common.utils';
// import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly client: OAuth2Client;
  constructor(private readonly prismaService: PrismaService) {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }
  private readonly logger = new Logger(AuthService.name);

  async getUserToken(user: authTokenDto) {
    const payload = {
      email: user.email,
      role: user?.role || Roles.NORMAL,
      name: user.firstname + ' ' + user.lastname,
    };
    const id = uuid();
    const refresh_token = sign(
      { id, ...payload },
      process.env[RefreshTokenSecret],
      refreshTokenConfig,
    );
    let sendedToken = refresh_token as string;
    const { data } = decodeRefreshToken(refresh_token);
    if (data) {
      const { success } = Jwt.addRefreshToken(data);
      if (success) {
        const { token } = encryptRefreshToken(refresh_token as string);
        if (token) {
          sendedToken = token;
        }
      }
      return {
        access_token: sign(
          { reId: id, ...payload },
          process.env[AccessTokenSecret],
          accessTokenConfig,
        ),
        refresh_token: sendedToken,
      };
    }
  }

  async registerUser(
    userinfo: registerBodyDto,
    images: Express.Multer.File[],
  ): Promise<successErrorDto> {
    const { user, error } = validateregisterUser(userinfo);
    if (error) {
      return { error };
    }
    try {
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });
      if (
        isUserExists &&
        isUserExists.isDeleted &&
        isUserExists.expiryDate < Date.now()
      ) {
        return {
          error: {
            status: 422,
            message:
              'Your Account has been expired please register with new one.',
          },
        };
      } else if (isUserExists) {
        return { error: { status: 422, message: 'User already exists' } };
      }
      const allimages = images.map((l) => l.destination + '/' + l.filename);
      const userdata = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: encrypt(user.password),
        gender: user.gender,
        age: Number(user.age),
        Images: [...allimages],
        lastlogin: Date.now(),
        expiryDate: getdefaultexpirydate(),
      };
      await this.prismaService.user.create({
        data: userdata,
      });
      return {
        success: true,
      };
    } catch (error) {
      this.logger.warn(error);
      return {
        error: { status: 500, message: 'Server error' },
      };
    }
  }

  async getLogin(loginInfo: loginBodyDto): Promise<loginUserDto> {
    const { error, user } = validateLoginUser(loginInfo);
    if (error) {
      return { error };
    }
    try {
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: user.email },
        include: { Companion: true },
      });
      const Companion = isUserExists && isUserExists.Companion[0];
      if (!isUserExists) {
        return { error: { status: 422, message: 'Invalid Credentials' } };
      } else if (user.password !== decrypt(isUserExists.password)) {
        return {
          error: { status: 422, message: 'Invalid Credentials' },
        };
      } else if (
        isUserExists &&
        isUserExists.isDeleted &&
        isUserExists.expiryDate < Date.now()
      ) {
        return {
          error: {
            status: 401,
            message: 'Account Deleted!. Please contact admin',
          },
        };
      } else if (
        isUserExists.isCompanion &&
        Companion.account !== AccountEnum.ACCEPTED
      ) {
        return {
          error: {
            status: 401,
            message: 'Invalid login. Please contact admin.',
          },
        };
      }
      const { access_token, refresh_token } =
        await this.getUserToken(isUserExists);
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      this.logger.warn(error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async getLogout(user: logoutParamsDto): Promise<successErrorDto> {
    const { email, reId } = user;
    if (!email || !email.trim().length) {
      return { error: { status: 422, message: 'email is required' } };
    }
    const { error } = Jwt.removeToken(reId);
    if (error) {
      return { error: { status: 403, message: 'Invalid Token' } };
    }

    return { success: true };
  }

  async getRefeshToken(token: refreshTokenParamsDto): Promise<loginUserDto> {
    const { token: refreshToken, error } = refreshTokenValidate(token);
    if (error) {
      return { error };
    }

    const payload = {
      reId: refreshToken.id,
      email: refreshToken.email,
      role: refreshToken.role,
      name: refreshToken.name,
    };
    return {
      access_token: sign(
        payload,
        process.env[AccessTokenSecret],
        accessTokenConfig,
      ) as string,
    };
  }

  async forgotPassword(dto: forgotPasswordInitDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!user) throw new ForbiddenException('Credentials incorrect');
      const { access_token } = await this.getUserToken(user);
      const subject = 'Reset Password Email';
      const message =
        'Click on this link for reset password : <a href="' +
        EMAILURL +
        'forgot-password/' +
        access_token +
        '">click</a>';
      const transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: dto.email,
        subject: subject,
        html: message,
      };
      const mailSent = await transporter.sendMail(mailOptions);
      if (mailSent) {
        return {
          success: true,
        };
      } else {
        return {
          message: 'Something went wrong. Please try again.',
        };
      }
      // eslint-disable-next-line
    } catch (error) {
      return {
        error: {
          status: 500,
          message: 'Something went wrong',
        },
      };
    }
  }

  async resetPassword(dto: forgotPasswordDto) {
    try {
      const { data, error } = validateToken('Bearer ' + dto.token);
      if (error) {
        return { error: { status: 403, message: 'Invalid Token' } };
      }
      const upadteUser = await this.prismaService.user.update({
        where: {
          email: data.email,
        },
        data: {
          password: encrypt(dto.password),
        },
      });
      if (upadteUser) {
        const { error } = Jwt.removeToken(data.reId);
        if (error) {
          return { error: { status: 403, message: 'Invalid Token' } };
        }
        return {
          success: true,
        };
      } else {
        return {
          success: false,
        };
      }
      // eslint-disable-next-line
    } catch (error) {
      return {
        error: {
          status: 422,
          message: ' The token has expired. Please try again.',
        },
      };
    }
  }

  async googleLogin(token: string) {
    try {
      const payload = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const collectedData = payload.getPayload();
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: collectedData.email },
      });
      if (!isUserExists) {
        return { error: { status: 422, message: 'Invalid Credentials' } };
      } else if (
        isUserExists &&
        isUserExists.isDeleted &&
        isUserExists.expiryDate < Date.now()
      ) {
        return {
          error: {
            status: 401,
            message: 'Account Deleted!. Please contact admin',
          },
        };
      } 
      const { access_token, refresh_token } =
        await this.getUserToken(isUserExists);
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      this.logger.warn(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async registerGoogleUser(token: string) {
    try {
      const payload = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const collectedData = payload.getPayload();
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: collectedData.email },
      });
      if (
        isUserExists &&
        isUserExists.isDeleted &&
        isUserExists.expiryDate < Date.now()
      ) {
        return {
          error: {
            status: 422,
            message:
              'Your Account has been expired please register with new one.',
          },
        };
      } else if (isUserExists) {
        return { error: { status: 422, message: 'User already exists' } };
      }
      await this.prismaService.user.create({
        data: {
          firstname: collectedData?.given_name || collectedData?.name,
          lastname: collectedData?.family_name || collectedData?.name,
          email: collectedData.email,
          password: encrypt('Test@123'),
          isGoogle: true,
          lastlogin: Date.now(),
          expiryDate: getdefaultexpirydate(),
        },
      });
      return {
        success: true,
      };
    } catch (error) {
      this.logger.warn(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }
  // async verifyCaptcha(token: any) {
  //   try {
  //     const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token.token}`;

  //     const res = await axios.post(url);

  //     console.log('res--->>>>', res.data);

  //     if (res.data.success) {
  //       return {
  //         success: true,
  //         data: res.data,
  //       };
  //     } else {
  //       return {
  //         success: false,
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       error: {
  //         status: 422,
  //         message: 'Invalid Captch',
  //       },
  //     };
  //   }
  // }
}
