import * as fs from 'fs';
import { IncomingMessage } from 'http';
import * as https from 'https';

export const Download = (
  uri: string,
  filename: string,
  callback?: (fileName: string) => void,
) => {
  const fileStream = fs.createWriteStream(filename);
  const req = https.get(uri, (res: IncomingMessage) => {
    res.pipe(fileStream);

    fileStream.on('error', (err: Error) => {
      console.error('ERROR:', err);
    });

    fileStream.on('close', () => {
      if (typeof callback == 'function') callback(filename);
    });

    fileStream.on('finish', () => {
      fileStream.close();
    });
  });

  req.on('error', (err: Error) => {
    console.error('ERROR:', err);
    throw new Error('Error Downloading Image');
  });

  if (fileStream.path.toString().length > 0) {
    return fileStream.path.toString();
  }
};

export async function handleImageInStorage(
  images: Express.Multer.File[],
  fileName? : string,
): Promise<string[]> {
  const imageUrls: string[] = [];
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    images.forEach((image) => {
      const localUrl =
        process.env.DEFAULT_URL + image.destination + '/' + image.filename;
      imageUrls.push(localUrl);
    });
  } else {
    const { S3Service } = await import('src/Services/s3.service');
    const awsservice = new S3Service();
    for (let i = 0; i < images.length; i += 1) {
      const filepath = fileName + Date.now();
      const { data } = await awsservice.uploadFileins3(
        filepath,
        images[i].buffer,
        images[i].mimetype,
      );
      if (data) {
        imageUrls.push(data);
      }
    }
  }
  return imageUrls;
}
