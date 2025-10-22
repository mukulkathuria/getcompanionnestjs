import { CompanionSettingDto } from "src/dto/companionsetting.dto";

export function validateCompanionSettingDto(companionSettingDto: CompanionSettingDto) {
  const errors: string[] = [];
  if (!companionSettingDto.isAvailable) {
    errors.push('isAvailable is required');
  }
//   if (!companionSettingDto.startDate) {
//     errors.push('startDate is required');
//   }
//   if (!companionSettingDto.endDate) {
//     errors.push('endDate is required');
//   }
  if (companionSettingDto.availabletimeslot.length >= 7) {
    errors.push('availabletimeslot must have 7 days');
  }
  companionSettingDto.availabletimeslot.forEach((slot) => {
    if (!slot.dayOfWeek) {
      errors.push('dayOfWeek is required');
    }
    if (!slot.startTime) {
      errors.push('startTime is required');
    }
    if (!slot.endTime) {
      errors.push('endTime is required');
    }
  })
  if(!errors.length){
    const values= {
        isAvailable: companionSettingDto.isAvailable,
        startDate: Number(companionSettingDto.startDate),
        endDate: Number(companionSettingDto.endDate),
        availabletimeslot: companionSettingDto.availabletimeslot.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: Number(slot.startTime),
          endTime: Number(slot.endTime),
        })),
    }
    return { success: true, values: values };
  }
  return { success: errors.length === 0, errors, values: null };
}