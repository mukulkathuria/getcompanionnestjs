import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const USERIMAGESMAXCOUNT = 1;
export const COMPANIONIMAGESMAXCOUNT = 4;
export const UserImageMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: 'UserPhotos',
    filename(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
};

export const USERISSUEIMAGESMAXCOUNT = 4;
export const UserIssuesImageMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: 'UserIssues',
    filename(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
}
