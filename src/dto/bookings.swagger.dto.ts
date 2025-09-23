import { ApiProperty } from '@nestjs/swagger';
import { BookingDurationUnitEnum, BookingMeetingLocationDto, BookingStatusEnum } from './bookings.dto';

export class BookingLocationDto implements BookingMeetingLocationDto {
  @ApiProperty({ 
    description: 'Latitude coordinate of the meeting location',
    example: 40.7128
  })
  lat: number;

  @ApiProperty({ 
    description: 'Longitude coordinate of the meeting location',
    example: -74.0060
  })
  lng: number;

  @ApiProperty({ 
    description: 'City of the meeting location',
    example: 'New York'
  })
  city: string;

  @ApiProperty({ 
    description: 'State of the meeting location',
    example: 'NY'
  })
  state: string;

  @ApiProperty({ 
    description: 'Name of the meeting location',
    example: 'Central Park'
  })
  name: string;

  @ApiProperty({ 
    description: 'User input for the meeting location',
    example: 'Central Park, New York'
  })
  userInput: string;

  @ApiProperty({ 
    description: 'Formatted address of the meeting location',
    example: 'Central Park, New York, NY 10022'
  })
  formattedaddress: string;

  @ApiProperty({ 
    description: 'Additional Google Maps data',
    additionalProperties: true,
    type: 'object'
  })
  googleextra: object;
}

export class CreateBookingDto {
  @ApiProperty({ 
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({ 
    description: 'Companion ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  companionId: string;

  @ApiProperty({ 
    description: 'Booking date in ISO format',
    example: '2023-12-25T14:00:00Z'
  })
  bookingdate: string;

  @ApiProperty({ 
    description: 'Duration of the booking',
    example: 2
  })
  bookingduration: number;

  @ApiProperty({ 
    description: 'Unit of booking duration',
    enum: BookingDurationUnitEnum,
    example: BookingDurationUnitEnum.HOUR
  })
  bookingdurationUnit: BookingDurationUnitEnum;

  @ApiProperty({ 
    description: 'Location details for the booking',
    type: BookingLocationDto
  })
  bookinglocation: BookingLocationDto;

  @ApiProperty({ 
    description: 'Purpose of the booking',
    example: 'Coffee meeting to discuss project collaboration'
  })
  purpose: string;
}

export class BookingResponseDto {
  @ApiProperty({ 
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Booking data',
    type: CreateBookingDto
  })
  data: CreateBookingDto;
}

export class BookingsListResponseDto {
  @ApiProperty({ 
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'List of bookings',
    type: [CreateBookingDto]
  })
  data: CreateBookingDto[];
}

export class CancelBookingDto {
  @ApiProperty({ 
    description: 'Booking ID to cancel',
    example: 12345
  })
  bookingid: number;

  @ApiProperty({ 
    description: 'Reason for cancellation',
    example: 'Schedule conflict',
    required: false
  })
  reason?: string;
}

export class BookingIdDto {
  @ApiProperty({ 
    description: 'Booking ID',
    example: 12345
  })
  bookingid: number;
}

export class RatingDto {
  @ApiProperty({ 
    description: 'Comment for the rating',
    example: 'Great experience!'
  })
  comment: string;

  @ApiProperty({ 
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5
  })
  rating: number;

  @ApiProperty({ 
    description: 'Booking ID',
    example: 12345
  })
  bookingid: number;
}

export class UpdateExtensionBookingDto {
  @ApiProperty({ 
    description: 'Booking ID',
    example: 12345
  })
  bookingid: number;

  @ApiProperty({ 
    description: 'Number of hours to extend',
    example: 2
  })
  extendedhours: number;

  @ApiProperty({ 
    description: 'Final rate after extension',
    example: 150.00
  })
  extentedfinalrate: number;

  @ApiProperty({ 
    description: 'Updated location details',
    type: BookingLocationDto,
    required: false
  })
  updatedLocation?: BookingLocationDto;

  @ApiProperty({ 
    description: 'Updated purpose',
    example: 'Extended meeting to cover additional topics',
    required: false
  })
  updatedPurpose?: string;
}

export class PageNoQueryDto {
  @ApiProperty({ 
    description: 'Page number',
    example: '1'
  })
  pageNo: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ 
    description: 'Booking ID',
    example: 12345
  })
  bookingid: number;

  @ApiProperty({ 
    description: 'New booking status',
    enum: BookingStatusEnum,
    example: BookingStatusEnum.ACCEPTED
  })
  status: BookingStatusEnum;
}