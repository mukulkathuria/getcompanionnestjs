export interface StartBookingBodyparamsDto {
    bookingid: number;
    otp: number;
} 

export interface SessionIdBodyParamsDto {
    sessionid: number;
}

export interface SessionExtendBodyParamsDto {
    bookingid: number;
    endtime?: string;
    extentedhours: number
}