import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'password123',
    type: String,
  })
  password: string;
}

export class AdminResponseDto {
  @ApiProperty({
    description: 'Admin data',
    type: Object,
  })
  data: any;

  @ApiProperty({
    description: 'Success message',
    example: 'Admin logged in successfully',
    type: String,
  })
  message: string;
}

export class CompanionApprovalDto {
  @ApiProperty({
    description: 'Companion ID to approve',
    example: '60d21b4667d0d8992e610c85',
    type: String,
  })
  companionId: string;

  @ApiProperty({
    description: 'Approval status',
    example: true,
    type: Boolean,
  })
  approved: boolean;
}

export class BookingStatusUpdateDto {
  @ApiProperty({
    description: 'Booking ID to update',
    example: '60d21b4667d0d8992e610c85',
    type: String,
  })
  bookingId: string;

  @ApiProperty({
    description: 'New booking status',
    example: 'completed',
    type: String,
  })
  status: string;
}

export class AdminPaginationQueryDto {
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
}

export class AdminIssueResponseDto {
  @ApiProperty({
    description: 'Issue ID',
    example: '60d21b4667d0d8992e610c85',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Issue title',
    example: 'Payment failed',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'Issue description',
    example: 'User payment failed due to gateway error',
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'Issue status',
    example: 'open',
    type: String,
  })
  status: string;

  @ApiProperty({
    description: 'User ID who reported the issue',
    example: '60d21b4667d0d8992e610c86',
    type: String,
  })
  userId: string;
}