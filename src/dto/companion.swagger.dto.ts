import { ApiProperty } from '@nestjs/swagger';

export class CompanionRequestDto {
  @ApiProperty({
    description: 'Companion name',
    example: 'John Doe',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Companion email',
    example: 'john.doe@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Companion phone number',
    example: '+1234567890',
    type: String,
  })
  phone: string;

  @ApiProperty({
    description: 'Companion bio',
    example: 'Professional companion with 5 years of experience',
    type: String,
  })
  bio: string;
}

export class CompanionAnalysisQueryDto {
  @ApiProperty({
    description: 'Start date for analysis',
    example: '2023-01-01',
    type: String,
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: 'End date for analysis',
    example: '2023-12-31',
    type: String,
    required: false,
  })
  endDate?: string;
}

export class CompanionBookingQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    type: Number,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    type: Number,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Booking status filter',
    example: 'completed',
    type: String,
    required: false,
  })
  status?: string;
}

export class CompanionResponseDto {
  @ApiProperty({
    description: 'Companion data',
    type: Object,
  })
  data: any;

  @ApiProperty({
    description: 'Success message',
    example: 'Companion request submitted successfully',
    type: String,
  })
  message: string;
}

export class CompanionAnalysisResponseDto {
  @ApiProperty({
    description: 'Total bookings',
    example: 45,
    type: Number,
  })
  totalBookings: number;

  @ApiProperty({
    description: 'Completed bookings',
    example: 38,
    type: Number,
  })
  completedBookings: number;

  @ApiProperty({
    description: 'Cancelled bookings',
    example: 7,
    type: Number,
  })
  cancelledBookings: number;

  @ApiProperty({
    description: 'Total earnings',
    example: 2500,
    type: Number,
  })
  totalEarnings: number;
}

export class BookingUpdateDto {
  @ApiProperty({
    description: 'Booking status',
    example: 'completed',
    type: String,
  })
  status: string;
}