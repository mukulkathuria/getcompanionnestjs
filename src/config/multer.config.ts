import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const USERIMAGESMAXCOUNT = 3;
export const UserImageMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: 'UserPhotos',
    filename(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
};
