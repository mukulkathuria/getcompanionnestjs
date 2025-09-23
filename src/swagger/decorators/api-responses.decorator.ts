import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Custom decorator for successful API responses
 * @param description Description of the successful response
 * @param type Response DTO type
 */
export function ApiSuccessResponse(description: string = 'Operation successful', type?: Type<any>) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      ...(type && { type }),
    }),
  );
}

/**
 * Custom decorator for created API responses
 * @param description Description of the created response
 * @param type Response DTO type
 */
export function ApiCreatedResponse(description: string = 'Resource created successfully', type?: Type<any>) {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description,
      ...(type && { type }),
    }),
  );
}

/**
 * Custom decorator for bad request API responses
 * @param description Description of the bad request response
 * @param type Response DTO type
 */
export function ApiBadRequestResponse(description: string = 'Bad request', type?: Type<any>) {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description,
      ...(type && { type }),
    }),
  );
}

/**
 * Custom decorator for unauthorized API responses
 * @param description Description of the unauthorized response
 * @param type Response DTO type
 */
export function ApiUnauthorizedResponse(description: string = 'Unauthorized', type?: Type<any>) {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description,
      ...(type && { type }),
    }),
  );
}

/**
 * Custom decorator for forbidden API responses
 * @param description Description of the forbidden response
 */
export function ApiForbiddenResponse(description: string = 'Forbidden') {
  return applyDecorators(
    ApiResponse({
      status: 403,
      description,
    }),
  );
}

/**
 * Custom decorator for not found API responses
 * @param description Description of the not found response
 */
export function ApiNotFoundResponse(description: string = 'Resource not found') {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description,
    }),
  );
}

/**
 * Custom decorator for server error API responses
 * @param description Description of the server error response
 */
export function ApiServerErrorResponse(description: string = 'Internal server error') {
  return applyDecorators(
    ApiResponse({
      status: 500,
      description,
    }),
  );
}

/**
 * Custom decorator for common API responses (success, bad request, unauthorized, server error)
 * @param successDescription Description of the successful response
 */
export function ApiCommonResponses(successDescription: string = 'Operation successful') {
  return applyDecorators(
    ApiSuccessResponse(successDescription),
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse(),
    ApiServerErrorResponse(),
  );
}