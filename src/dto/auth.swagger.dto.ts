import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum } from './user.dto';

export class RegisterDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: true,
  })
  firstname: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: true,
  })
  lastname: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    required: true,
  })
  password: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: true,
  })
  phoneno: string;

  @ApiProperty({
    description: 'User profile images',
    type: [String],
    required: false,
  })
  Images?: string[];

  @ApiProperty({
    description: 'User gender',
    enum: GenderEnum,
    example: GenderEnum.MALE,
    required: true,
  })
  gender: GenderEnum;

  @ApiProperty({
    description: 'User age',
    example: '25',
    required: true,
  })
  age: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    required: true,
  })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message if any',
    example: '',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  access_token?: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refresh_token?: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
    required: false,
  })
  isEmailverified?: boolean;

  @ApiProperty({
    description: 'Whether user has completed any booking',
    example: false,
    required: false,
  })
  anybookingdone?: boolean;
}

export class ForgotPasswordInitDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'Email verification flag',
    example: true,
    required: false,
  })
  emailverification?: boolean;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'One-time password received via email',
    example: '123456',
    required: true,
  })
  OTP: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123!',
    required: true,
  })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  refresh_token: string;
}