import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiBodyDto } from './api-body.decorator';
import { 
  ApiSuccessResponse, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiUnauthorizedResponse 
} from './api-responses.decorator';

/**
 * Comprehensive decorator for GET endpoints
 * @param summary Operation summary
 * @param responseType Response DTO type
 * @param responseDescription Description of the successful response
 */
export function ApiGetEndpoint(
  summary: string,
  responseType: Type<any>,
  responseDescription: string = 'Data retrieved successfully'
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiSuccessResponse(responseDescription, responseType),
    ApiBadRequestResponse()
  );
}

/**
 * Comprehensive decorator for GET endpoints with query parameters
 * @param summary Operation summary
 * @param responseType Response DTO type
 * @param queryParams Array of query parameter configurations
 * @param responseDescription Description of the successful response
 */
export function ApiGetEndpointWithQuery(
  summary: string,
  responseType: Type<any>,
  queryParams: Array<{ name: string; description: string; type: any; required?: boolean }>,
  responseDescription: string = 'Data retrieved successfully'
) {
  const decorators = [
    ApiOperation({ summary }),
    ApiSuccessResponse(responseDescription, responseType),
    ApiBadRequestResponse()
  ];

  queryParams.forEach(param => {
    decorators.push(
      ApiQuery({
        name: param.name,
        description: param.description,
        type: param.type,
        required: param.required !== undefined ? param.required : true
      })
    );
  });

  return applyDecorators(...decorators);
}

/**
 * Comprehensive decorator for POST endpoints
 * @param summary Operation summary
 * @param requestType Request DTO type
 * @param responseType Response DTO type
 * @param requestDescription Description of the request body
 * @param responseDescription Description of the successful response
 */
export function ApiPostEndpoint(
  summary: string,
  requestType: Type<any>,
  responseType: Type<any>,
  requestDescription: string = 'Request body',
  responseDescription: string = 'Operation successful'
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBodyDto(requestType, requestDescription),
    ApiSuccessResponse(responseDescription, responseType),
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse()
  );
}

/**
 * Comprehensive decorator for POST endpoints that create resources
 * @param summary Operation summary
 * @param requestType Request DTO type
 * @param responseType Response DTO type
 * @param requestDescription Description of the request body
 * @param responseDescription Description of the successful response
 */
export function ApiCreateEndpoint(
  summary: string,
  requestType: Type<any>,
  responseType: Type<any>,
  requestDescription: string = 'Request body',
  responseDescription: string = 'Resource created successfully'
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBodyDto(requestType, requestDescription),
    ApiCreatedResponse(responseDescription, responseType),
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse()
  );
}

/**
 * Comprehensive decorator for PUT/PATCH endpoints
 * @param summary Operation summary
 * @param requestType Request DTO type
 * @param responseType Response DTO type
 * @param requestDescription Description of the request body
 * @param responseDescription Description of the successful response
 */
export function ApiUpdateEndpoint(
  summary: string,
  requestType: Type<any>,
  responseType: Type<any>,
  requestDescription: string = 'Request body',
  responseDescription: string = 'Resource updated successfully'
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBodyDto(requestType, requestDescription),
    ApiSuccessResponse(responseDescription, responseType),
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse()
  );
}

/**
 * Comprehensive decorator for DELETE endpoints
 * @param summary Operation summary
 * @param responseType Response DTO type
 * @param responseDescription Description of the successful response
 */
export function ApiDeleteEndpoint(
  summary: string,
  responseType: Type<any>,
  responseDescription: string = 'Resource deleted successfully'
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiSuccessResponse(responseDescription, responseType),
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse()
  );
}

/**
 * Comprehensive decorator for endpoints with path parameters
 * @param summary Operation summary
 * @param responseType Response DTO type
 * @param pathParams Array of path parameter configurations
 * @param responseDescription Description of the successful response
 */
export function ApiEndpointWithParams(
  summary: string,
  responseType: Type<any>,
  pathParams: Array<{ name: string; description: string; type: any }>,
  responseDescription: string = 'Operation successful'
) {
  const decorators = [
    ApiOperation({ summary }),
    ApiSuccessResponse(responseDescription, responseType),
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse()
  ];

  pathParams.forEach(param => {
    decorators.push(
      ApiParam({
        name: param.name,
        description: param.description,
        type: param.type
      })
    );
  });

  return applyDecorators(...decorators);
}