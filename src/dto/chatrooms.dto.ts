import { message, User } from "@prisma/client";
import { errorDto } from "./common.dto";

export interface ChatRoomReturnDto extends errorDto {
    data?: any
}

export interface ChatRoomIdDto {
    chatroomid: string
}

export interface UserChatMessagesReturnDto extends errorDto{
    data?: message[]
}