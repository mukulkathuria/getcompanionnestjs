import { ApiProperty } from '@nestjs/swagger';
import { UserlocationProfileDto } from './user.dto';

export class UserProfileParamsDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;
}

export class UserLocationDto implements UserlocationProfileDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 40.7128
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -74.0060
  })
  lng: number;

  @ApiProperty({
    description: 'City name',
    example: 'New York'
  })
  city: string;

  @ApiProperty({
    description: 'State name',
    example: 'NY'
  })
  state: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Manhattan'
  })
  name: string;

  @ApiProperty({
    description: 'User input for location',
    example: 'Manhattan, New York'
  })
  userInput: string;

  @ApiProperty({
    description: 'Formatted address',
    example: 'Manhattan, New York, NY 10001'
  })
  formattedaddress: string;

  @ApiProperty({
    description: 'Additional Google Maps data',
    type: 'object',
    additionalProperties: true,
  })
  googleextra: object;
}

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    required: false
  })
  name?: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
    required: false
  })
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'User location details',
    type: UserLocationDto,
    required: false
  })
  location?: UserLocationDto;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer with 5 years of experience',
    required: false
  })
  bio?: string;
}

export class CompanionUpdateRequestDto {
  @ApiProperty({
    description: 'Companion ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  companionId: string;

  @ApiProperty({
    description: 'Hourly rate',
    example: 50.00,
    required: false
  })
  hourlyrate?: number;

  @ApiProperty({
    description: 'Companion bio',
    example: 'Professional companion with expertise in social events',
    required: false
  })
  bio?: string;

  @ApiProperty({
    description: 'Companion location',
    type: UserLocationDto,
    required: false
  })
  location?: UserLocationDto;
}

export class CompanionDetailsQueryDto {
  @ApiProperty({
    description: 'Companion ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  companionId: string;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'User profile data',
    type: 'object',
    additionalProperties: true
  })
  data: object;

  @ApiProperty({
    description: 'Response message',
    example: 'User Updated successfully.'
  })
  message: string;
}

export class CompanionDetailsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Companion details',
    type: 'object',
    additionalProperties: true
  })
  data: object;
}