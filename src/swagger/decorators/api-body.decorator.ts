import { applyDecorators, Type } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

/**
 * Custom decorator for API request body
 * @param type Request DTO type
 * @param description Description of the request body
 */
export function ApiBodyDto<T>(type: Type<T>, description: string = 'Request body') {
  return applyDecorators(
    ApiBody({
      type,
      description,
      required: true,
    }),
  );
}