import { ApiProperty } from '@nestjs/swagger';
import { ImageMimeType, joinedRoomDto, messageContentType, messageRoomDto, sendFileDto } from 'src/Modules/chats/dto/joinroom.dto';

export class JoinRoomDto implements joinedRoomDto {
  @ApiProperty({
    description: 'The unique identifier of the chat room',
    example: '60d21b4667d0d8992e610c85',
    type: String,
  })
  roomid: string;

  @ApiProperty({
    description: 'The unique identifier of the user joining the room',
    example: '60d21b4667d0d8992e610c86',
    type: String,
  })
  userid: string;
}

export class MessageContentDto implements messageContentType {
  @ApiProperty({
    description: 'The unique identifier of the message sender',
    example: '60d21b4667d0d8992e610c86',
    type: String,
  })
  sender: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you?',
    type: String,
  })
  content: string;
}

export class MessageRoomDto extends JoinRoomDto implements messageRoomDto {
  @ApiProperty({
    description: 'The message content and sender information',
    type: MessageContentDto,
  })
  message: MessageContentDto;
}

export class SendFileDto extends JoinRoomDto implements sendFileDto {
  @ApiProperty({
    description: 'The file buffer to be sent',
    type: 'string',
    format: 'binary',
  })
  file: Buffer;

  @ApiProperty({
    description: 'The MIME type of the image',
    enum: ImageMimeType,
    example: ImageMimeType.jpeg,
  })
  mimeType: ImageMimeType;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'The chat data returned from the operation',
    type: Object,
  })
  data: any;

  @ApiProperty({
    description: 'Success message',
    example: 'Message sent successfully',
    type: String,
  })
  message: string;
}