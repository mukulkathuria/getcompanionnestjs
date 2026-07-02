export enum ImageMimeType {
    jpg = 'image/jpg',
    jpeg = 'image/jpeg',
    png = 'image/png',
  }
  
  export type joinedRoomDto = {
    roomid: number;
    userid: number;
  };
  
  export interface messageContentType {
    sender: number;
    content: string;
  }

  export interface messageRoomDto extends joinedRoomDto {
    message: messageContentType;
  }
  
  export interface sendFileDto extends joinedRoomDto {
    file: Buffer;
    mimeType: ImageMimeType;
  }