import { CompanionSettingDto } from 'src/dto/companionsetting.dto';

export function validateCompanionSettingDto(
  companionSettingDto: CompanionSettingDto,
) {
  const errors: string[] = [];
  try {
    if (companionSettingDto.availabletimeslot) {
      const tempslots = JSON.parse(
        companionSettingDto.availabletimeslot as any,
      );
      companionSettingDto.availabletimeslot = tempslots;
    }
  } catch (error) {
    console.log(
      'Error JSON in availabletimeslot',
      error,
      companionSettingDto.availabletimeslot,
    );
    return {
      success: false,
      errors: ['Companion availabletimeslot is not valid'],
    };
  }
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
    if (
      typeof slot.dayOfWeek !== 'number' ||
      slot.dayOfWeek < 0 ||
      slot.dayOfWeek > 6
    ) {
      errors.push('dayOfWeek must be a number between 0 and 6');
    }
    if (!slot.startTime || slot.startTime.length !== 13) {
      errors.push('startTime is required');
    }
    if (!slot.endTime || slot.endTime.length !== 13) {
      errors.push('endTime is required');
    }
  });
  if (!errors.length) {
    const values = {
      isAvailable: companionSettingDto.isAvailable,
      startDate: Number(companionSettingDto.startDate),
      endDate: Number(companionSettingDto.endDate),
      availabletimeslot: companionSettingDto.availabletimeslot.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: Number(slot.startTime),
        endTime: Number(slot.endTime),
      })),
    };
    return { success: true, values: values };
  }
  return { success: errors.length === 0, errors, values: null };
}
