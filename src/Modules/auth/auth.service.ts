import { Injectable, Logger } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
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
  basicuservalidationforuserExists,
  refreshTokenValidate,
  validateLoginUser,
  validateregisterUser,
} from 'src/validations/auth.validation';
import { getdefaultexpirydate } from 'src/utils/common.utils';
import { NodeMailerService } from 'src/Services/nodemailer.service';
import { GoogleService } from 'src/Services/googlelogin.service';
// import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodemailerService: NodeMailerService,
    private readonly googleservice: GoogleService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async getUserToken(user: authTokenDto) {
    const payload = {
      email: user.email,
      role: user?.role || Roles.NORMAL,
      name: user?.firstname + ' ' + user?.lastname,
      userId: user?.id,
      isCompanion: Boolean(user?.isCompanion),
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
      const { error } = basicuservalidationforuserExists(isUserExists, true);
      if (error) {
        return { error };
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
      const { error } = basicuservalidationforuserExists(isUserExists);
      if (error) {
        return { error };
      } else if (user.password !== decrypt(isUserExists.password)) {
        return {
          error: { status: 422, message: 'Invalid Credentials' },
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
      // const user = await this.prismaService.user.findUnique({
      //   where: {
      //     email: dto.email,
      //   },
      // });
      // const { error } = basicuservalidationforuserExists(user);
      // if (error) {
      //   return { error };
      // }
      // const { access_token } = await this.getUserToken(user);
      const subject = 'Reset Password Email';
      const message = 'YOU forgot your password here is your OTP:';
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: dto.email,
        subject: subject,
        html: message,
      };
      const mailSent = await this.nodemailerService.sendMail(mailOptions);
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
      this.logger.error(error?.message || error);
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
      const updateuser = await this.prismaService.user.update({
        where: {
          email: data.email,
        },
        data: {
          password: encrypt(dto.password),
        },
      });
      if (updateuser) {
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
      const { data: collectedData } =
        await this.googleservice.verifyGoogleToken(token);
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: collectedData.email },
      });
      const { error } = basicuservalidationforuserExists(isUserExists);
      if (error) {
        return { error };
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
      const { data: collectedData } =
        await this.googleservice.verifyGoogleToken(token);
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: collectedData.email },
      });
      const { error } = basicuservalidationforuserExists(isUserExists, true);
      if (error) {
        return { error };
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
