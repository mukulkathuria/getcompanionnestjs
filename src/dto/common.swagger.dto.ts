import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid credentials',
  })
  error: string;
}

export class ApiSuccessResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
    required: false,
  })
  message?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;
}