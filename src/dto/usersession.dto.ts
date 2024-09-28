export interface StartBookingBodyparamsDto {
    bookingid: number;
    otp: number;
} 

export interface SessionIdBodyParamsDto {
    sessionid: string;
}

export interface SessionExtendBodyParamsDto extends SessionIdBodyParamsDto{
    endtime: string;
}