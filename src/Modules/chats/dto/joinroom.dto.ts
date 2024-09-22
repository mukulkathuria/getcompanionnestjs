export enum ImageMimeType {
    jpg = 'image/jpg',
    jpeg = 'image/jpeg',
    png = 'image/png',
  }
  
  export type joinedRoomDto = {
    roomid: string;
    username: string;
  };
  
  export interface messageContentType {
    sender: string;
    content: string;
  }

  export interface messageRoomDto extends joinedRoomDto {
    message: messageContentType;
  }
  
  export interface sendFileDto extends joinedRoomDto {
    file: Buffer;
    mimeType: ImageMimeType;
  }