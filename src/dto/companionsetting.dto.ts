export interface AvailableTimeSlot {
  dayOfWeek: number;
  startTime: string ;
  endTime: string;
}

export interface AvailableTimeSlotBigInt {
  dayOfWeek: number;
  startTime:  bigint;
  endTime: bigint;
}

export interface CompanionSettingDto {
  isAvailable: boolean;
  startDate: Date;
  endDate: Date;
  availabletimeslot: AvailableTimeSlot[];
}
