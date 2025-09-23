import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Custom decorator to apply Swagger API tags to controllers
 * This allows controllers to use Swagger tags without directly importing Swagger
 * @param name The tag name to apply to the controller
 */
export function ApiControllerTag(name: string) {
  return applyDecorators(ApiTags(name));
}