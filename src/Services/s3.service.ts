import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly s3client: S3Client;
  constructor() {
    this.s3client = new S3Client({
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY'],
        secretAccessKey: process.env['AWS_SECRET_KEY'],
      },
    });
  }

  async getFilefroms3(bucketname: string, filename: string) {
    try {
      const input = {
        Bucket: bucketname,
        Key: filename,
      };
      const command = new GetObjectCommand(input);
      const response = await this.s3client.send(command);
      return { data: response };
    } catch (error) {
      return {
        error: {
          status: 500,
          message: error?.message || 'Could not get file from s3',
        },
      };
    }
  }

  async uploadFileins3(
    pathfilename: string,
    buffer: Buffer,
    contenttype: string,
  ) {
    try {
      const input = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: pathfilename,
        Body: buffer,
        ContentType: contenttype,
      };
      const command = new PutObjectCommand(input);
      await this.s3client.send(command);
      return {
        data: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pathfilename}`,
      };
    } catch (error) {
      return {
        error: {
          status: 500,
          message: error?.message || 'Could not upload file in s3',
        },
      };
    }
  }

  async deleteFilefroms3(bucketname: string, filename: string) {
    try {
      const input = {
        Bucket: bucketname,
        Key: filename,
      };
      const command = new DeleteObjectCommand(input);
      const response = await this.s3client.send(command);
      return { data: response };
    } catch (error) {
      return {
        error: {
          status: 500,
          message: error?.message || 'Could not able to delete file from s3',
        },
      };
    }
  }
}
