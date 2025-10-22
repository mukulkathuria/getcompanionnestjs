export interface AvailableTimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CompanionSettingDto {
  isAvailable: boolean;
  startDate: Date;
  endDate: Date;
  availabletimeslot: AvailableTimeSlot[];
}
