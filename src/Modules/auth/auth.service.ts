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
  tokenInputDto,
} from 'src/dto/auth.module.dto';
import { successErrorDto } from 'src/dto/common.dto';
import { authTokenDto } from 'src/dto/tokens.dto';
import { decodeRefreshToken } from 'src/guards/strategies/jwt.strategy';
import { PrismaService } from 'src/Services/prisma.service';
import { Jwt } from 'src/tokens/Jwt';
import { decrypt, encrypt, encryptRefreshToken } from 'src/utils/crypt.utils';
import { uuid } from 'src/utils/uuid.utils';
import {
  basicuservalidationforuserExists,
  refreshTokenValidate,
  validateEmailVerificationInputs,
  validateLoginUser,
  validateregisterUser,
  validateresetPasswordInputs,
} from 'src/validations/auth.validation';
import { addHours, getdefaultexpirydate } from 'src/utils/common.utils';
import { NodeMailerService } from 'src/Services/nodemailer.service';
import { GoogleService } from 'src/Services/googlelogin.service';
import emailTemplate from 'src/templates/email.template';
import { NotificationFromModuleEnum } from 'src/dto/bookings.dto';
import { Notificationhours } from 'src/constants/common.constants';
import notificationTemplate from 'src/templates/notification.template';
import { S3Service } from 'src/Services/s3.service';
// import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodemailerService: NodeMailerService,
    private readonly googleservice: GoogleService,
    private readonly awsservice: S3Service,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async getUserToken(user: authTokenDto) {
    const payload = {
      email: user.email,
      role: user?.role || Roles.NORMAL,
      name: user?.firstname + ' ' + user?.lastname,
      userId: user?.id,
      isCompanion: Boolean(user?.isCompanion),
      Images: user.Images,
      isEmailVerified: user.isEmailVerified,
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
      // const allimages = images.map((l) => process.env.DEFAULT_URL + l.destination + '/' + l.filename);
      const allimages = [];
      for (let i = 0; i < images.length; i += 1) {
        const filepath = 'userphotos/' + userinfo.email + Date.now();
        const { data } = await this.awsservice.uploadFileins3(
          filepath,
          images[i].buffer,
          images[i].mimetype,
        );
        if (data) {
          allimages.push(data);
        }
      }
      const userdata = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: encrypt(user.password),
        gender: user.gender,
        age: Number(user.age),
        Images: [...allimages],
        lastlogin: Date.now(),
        phoneno: Number(user.phoneno),
        expiryDate: getdefaultexpirydate(),
      };
      await this.prismaService.user.create({
        data: {
          ...userdata,
          notifications: {
            create: {
              fromModule: NotificationFromModuleEnum.USER,
              expiry: addHours(Notificationhours.welcomeuser),
              content: notificationTemplate({
                username: user.firstname,
              }).welcomeuser,
              reminders: [],
            },
          },
        },
      });
      const {
        welcome: { subject, body },
      } = emailTemplate({ username: user.firstname });
      this.nodemailerService
        .sendMail({
          to: user.email,
          subject,
          html: body,
        })
        .then(() => {
          this.logger.log(`Email sent to: ${user.email}`);
        });
      await this.forgotPassword({ email: user.email });
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
        anybookingdone: isUserExists.anybookingdone,
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
      role: refreshToken?.role || Roles.NORMAL,
      userId: refreshToken?.userId,
      name: refreshToken.name,
      isCompanion: Boolean(refreshToken?.isCompanion),
      Images: refreshToken.Images,
      isEmailVerified: refreshToken.isEmailVerified,
    };
    return {
      access_token: sign(
        payload,
        process.env[AccessTokenSecret],
        accessTokenConfig,
      ) as string,
    };
  }

  async forgotPassword(
    dto: forgotPasswordInitDto,
    isEmailVerification?: boolean,
  ) {
    try {
      const { EmailRegex } = await import('../../constants/regex.constants');
      const { createOTP } = await import('../../utils/common.utils');
      const { OTPData } = await import('../../Cache/OTP');
      if (!dto.email || !EmailRegex.test(dto.email)) {
        return { error: { status: 422, message: 'Invalid email' } };
      }
      const user = await this.prismaService.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      const { error } = basicuservalidationforuserExists(user);
      if (error) {
        return { error };
      }
      const OTP = createOTP();
      OTPData.set(user.email, { otp: String(OTP) });
      const { forgotPassword, emailVerification } = emailTemplate({
        username: user.firstname,
        otp: String(OTP),
      });
      const mailOptions = {
        to: dto.email,
        subject: isEmailVerification
          ? emailVerification.subject
          : forgotPassword.subject,
        html: isEmailVerification
          ? emailVerification.body
          : forgotPassword.body,
      };
      const { success, error: sendmailerror } =
        await this.nodemailerService.sendMail(mailOptions);
      if (success) {
        return { success };
      } else {
        return { error: sendmailerror };
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
      const { error: validatateerror } = validateresetPasswordInputs(dto);
      if (validatateerror) {
        return { error: validatateerror };
      }
      const { OTPData } = await import('../../Cache/OTP');
      const { error } = OTPData.checkValidOTP(dto.email, dto.OTP);
      if (error) {
        return { error: { status: 422, message: 'Invalid token' } };
      }
      const updateuser = await this.prismaService.user.update({
        where: {
          email: dto.email,
        },
        data: {
          password: encrypt(dto.password),
        },
      });
      if (updateuser) {
        return { success: true };
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

  async googleLogin(tokenInput: tokenInputDto) {
    try {
      const { data: collectedData, error: googleerror } =
        await this.googleservice.verifyGoogleToken(tokenInput);
      if (googleerror) {
        this.logger.error(googleerror);
        return { error: { status: 422, message: 'Invalid Token' } };
      }
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: collectedData.email },
      });
      const { error } = basicuservalidationforuserExists(isUserExists);
      if (error) {
        return { error };
      } else if (!isUserExists.isGoogle) {
        return {
          error: {
            status: 422,
            message: 'The Authentication method is not same as sign up!',
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

  async registerGoogleUser(tokenInput: tokenInputDto) {
    try {
      const { data: collectedData } =
        await this.googleservice.verifyGoogleToken(tokenInput);
      const isUserExists = await this.prismaService.user.findUnique({
        where: { email: collectedData.email },
      });
      const { error } = basicuservalidationforuserExists(isUserExists, true);
      if (error) {
        return { error };
      }
      const userDetails = await this.prismaService.user.create({
        data: {
          firstname: collectedData?.given_name || collectedData?.name,
          lastname: collectedData?.family_name || collectedData?.name,
          email: collectedData.email,
          password: encrypt('Test@123'),
          isGoogle: true,
          isEmailVerified: true,
          lastlogin: Date.now(),
          expiryDate: getdefaultexpirydate(),
        },
      });
      const {
        welcome: { subject, body },
      } = emailTemplate({ username: collectedData.given_name });
      this.nodemailerService
        .sendMail({
          to: collectedData.email,
          subject,
          html: body,
        })
        .then(() => {
          this.logger.log(`Email sent to: ${collectedData.email}`);
        });
      const { access_token, refresh_token } =
        await this.getUserToken(userDetails);
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      this.logger.warn(error?.message || error);
      return { error: { status: 500, message: 'Server error' } };
    }
  }

  async validateEmailOTP(dto: forgotPasswordDto) {
    try {
      const { error: validatateerror } = validateEmailVerificationInputs(dto);
      if (validatateerror) {
        return { error: validatateerror };
      }
      const { OTPData } = await import('../../Cache/OTP');
      const { error } = OTPData.checkValidOTP(dto.email, dto.OTP);
      if (error) {
        return { error: { status: 422, message: 'Invalid token' } };
      }
      const updateuser = await this.prismaService.user.update({
        where: {
          email: dto.email,
        },
        data: {
          isEmailVerified: true,
        },
      });
      if (updateuser) {
        return { success: true };
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
