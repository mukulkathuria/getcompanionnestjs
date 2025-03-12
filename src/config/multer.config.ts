import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const USERIMAGESMAXCOUNT = 1;
export const COMPANIONIMAGESMAXCOUNT = 4;
export const COMPANIONREQUESTMAXCOUNT = 2;

export const UserImageMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: 'Images/UserPhotos',
    filename(req, file, cb) {
      cb(null, file.originalname);
    },
  }),
};

export const RequestCompanionImageMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: 'Images/CompanionRequest',
    filename(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
};

export const USERISSUEIMAGESMAXCOUNT = 4;
export const UserIssuesImageMulterConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: 'Images/UserIssues',
    filename(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
};
