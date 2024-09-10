import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File[]) {
    const MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
    if (value && value.length) {
      const files = [...value];
      for (let i = 0; i < files.length; i += 1) {
        const filename = files[i].destination + '/' + files[i].filename;
        if (!MIME_TYPES.includes(files[i].mimetype)) {
          fs.unlinkSync(filename);
          throw new BadRequestException(
            'The image should be either jpeg, png, or webp.',
          );
        } else if (files[i].size >= 1 * 1024 * 1024) {
          fs.unlinkSync(filename);
          throw new BadRequestException('The Image size is not valid');
        }
      }
    }

    return value;
  }
}
