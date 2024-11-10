import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { sendMailInputDto } from 'src/dto/auth.module.dto';

@Injectable()
export class NodeMailerService {
    private readonly client: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.client = createTransport({
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
  }

  async sendMail(mailOptions: sendMailInputDto) {
    try {
      const mailSent = await this.client.sendMail(mailOptions);
      if (mailSent) {
        return {
          success: true,
        };
      } else {
        return {
          error: {
            status: 422,
            message: 'Something went wrong. Please try again.',
          },
        };
      }
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
