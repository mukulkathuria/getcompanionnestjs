export interface StartBookingBodyparamsDto {
    bookingid: number;
    otp: number;
} 

export interface SessionIdBodyParamsDto {
    sessionid: string;
}

export interface SessionExtendBodyParamsDto {
    bookingid: number;
    endtime?: string;
    extentedhours: number
}