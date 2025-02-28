import {
  ImageMimeType,
  joinedRoomDto,
  messageRoomDto,
  sendFileDto,
} from '../dto/joinroom.dto';

export const joinedRoomValidation = (roomdata: joinedRoomDto) => {
  const { roomid, userid } = roomdata;
  if (!roomid) {
    return { error: { status: 422, message: 'Chat Room is required' } };
  } else if (!userid || !userid.trim().length) {
    return { error: { status: 422, message: 'userid is required' } };
  }
  return { user: roomdata };
};

export const messageRoomValidation = (roomdata: messageRoomDto) => {
  const { roomid, userid, message } = roomdata;
  if (!roomid) {
    return { error: { status: 422, message: 'Chat Room is required' } };
  } else if (!userid || !userid.trim().length) {
    return { error: { status: 422, message: 'userid is required' } };
  } else if (message && (!message?.sender || !message?.content)) {
    return { error: { status: 422, message: 'Message Type is required' } };
  }
  return { user: roomdata };
};

export const fileSendValidation = (roomdata: sendFileDto) => {
  const { roomid, userid, file, mimeType } = roomdata;
  if (!roomid) {
    return { error: { status: 422, message: 'Chat Room is required' } };
  } else if (!userid || !userid.trim().length) {
    return { error: { status: 422, message: 'userid is required' } };
  } else if (!file) {
    return { error: { status: 422, message: 'File is required' } };
  } else if (file.byteLength > 1024 * 1024 * 2) {
    return { error: { status: 413, message: 'File size exceed' } };
  } else if (!Object.values(ImageMimeType).includes(mimeType)) {
    return { error: { status: 415, message: 'Invalid File' } };
  }
  return { user: roomdata };
};
