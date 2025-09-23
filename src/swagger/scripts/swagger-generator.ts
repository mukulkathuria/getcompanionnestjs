import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

/**
 * Script to automate adding Swagger decorators to controller methods
 * This script analyzes controller files and adds appropriate Swagger decorators
 */

// Configuration
const MODULES_DIR = path.resolve(__dirname, '../../Modules');
const CONTROLLER_SUFFIX = '.controller.ts';

// Helper to check if a file is a controller
const isControllerFile = (fileName: string): boolean => {
  return fileName.endsWith(CONTROLLER_SUFFIX);
};

// Find all controller files in the project
function findControllerFiles(dir: string): string[] {
  const files: string[] = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...findControllerFiles(fullPath));
    } else if (isControllerFile(item.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Parse a TypeScript file and get its AST
function parseTypeScriptFile(filePath: string): ts.SourceFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
}

// Define interface for controller method information
interface ControllerMethod {
  name: string;
  httpMethod: string | undefined;
  hasRequestBody: boolean;
  returnType: string;
  hasSwaggerDecorators: boolean;
  node: ts.MethodDeclaration;
}

// Extract method information from a controller file
function extractControllerMethods(sourceFile: ts.SourceFile): ControllerMethod[] {
  const methods: ControllerMethod[] = [];
  
  function visit(node: ts.Node): void {
    // Look for method declarations in classes
    if (ts.isMethodDeclaration(node) && 
        ts.getDecorators(node) &&
        ts.getDecorators(node)?.some(d => {
          const text = d.expression.getText(sourceFile);
          return text.includes('Post') || 
                 text.includes('Get') || 
                 text.includes('Put') || 
                 text.includes('Delete') || 
                 text.includes('Patch');
        })) {
      
      // Extract method name
      const methodName = node.name.getText(sourceFile);
      
      // Extract HTTP method type
      const httpMethod = ts.getDecorators(node)?.find(d => {
        const text = d.expression.getText(sourceFile);
        return text.includes('Post') || 
               text.includes('Get') || 
               text.includes('Put') || 
               text.includes('Delete') || 
               text.includes('Patch');
      })?.expression.getText(sourceFile);
      
      // Extract parameters to check for @Body() decorators
      const hasRequestBody = node.parameters.some(param => 
        ts.getDecorators(param)?.some(d =>
          d.expression.getText(sourceFile).includes('Body')
        )
      );
      
      // Extract return type
      const returnType = node.type ? node.type.getText(sourceFile) : 'any';
      
      // Check if method already has Swagger decorators
      const hasSwaggerDecorators = ts.getDecorators(node)?.some(d => {
        const text = d.expression.getText(sourceFile);
        return text.includes('ApiOperation') || 
               text.includes('ApiBody') || 
               text.includes('ApiResponse');
      });
      
      methods.push({
        name: methodName,
        httpMethod,
        hasRequestBody,
        returnType,
        hasSwaggerDecorators,
        node
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return methods;
}

// Generate Swagger decorators for a method
function generateSwaggerDecorators(method: ControllerMethod, controllerName: string): string {
  const decorators: string[] = [];
  
  // Add ApiOperation decorator
  const operationSummary = method.name
    .replace(/Controller$/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
  
  decorators.push(`@ApiOperation({ summary: '${operationSummary}' })`);
  
  // Add ApiBody decorator if method has request body
  if (method.hasRequestBody) {
    // Try to determine the DTO type from the method name
    const entityName = controllerName
      .replace(/Controller$/, '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    
    const action = method.name.startsWith('create') ? 'Create' :
                  method.name.startsWith('update') ? 'Update' :
                  method.name.startsWith('delete') ? 'Delete' :
                  method.name.startsWith('get') ? 'Get' :
                  'Request';
    
    const dtoName = `${action}${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto`;
    decorators.push(`@ApiBodyDto(${dtoName})`);
  }
  
  // Add ApiResponse decorators based on HTTP method
  if (method.httpMethod && method.httpMethod.includes('Post')) {
    if (method.httpMethod.includes('201')) {
      decorators.push(`@ApiCreatedResponse('Resource created successfully', ${controllerName}ResponseDto)`);
    } else {
      decorators.push(`@ApiSuccessResponse('Operation successful', ${controllerName}ResponseDto)`);
    }
  } else if (method.httpMethod && method.httpMethod.includes('Get')) {
    decorators.push(`@ApiSuccessResponse('Data retrieved successfully', ${controllerName}ResponseDto)`);
  } else if (method.httpMethod && (method.httpMethod.includes('Put') || method.httpMethod.includes('Patch'))) {
    decorators.push(`@ApiSuccessResponse('Resource updated successfully', ${controllerName}ResponseDto)`);
  } else if (method.httpMethod && method.httpMethod.includes('Delete')) {
    decorators.push(`@ApiSuccessResponse('Resource deleted successfully', ApiSuccessResponseDto)`);
  }
  
  // Add common error responses
  decorators.push(`@ApiBadRequestResponse('Invalid request data', ApiErrorResponseDto)`);
  
  if (method.httpMethod && !method.httpMethod.includes('Get')) {
    decorators.push(`@ApiUnauthorizedResponse('Unauthorized access', ApiErrorResponseDto)`);
  }
  
  return decorators.join('\n');
}

// Generate imports for Swagger decorators
function generateSwaggerImports(): string {
  return `import { ApiOperation } from '@nestjs/swagger';
import { ApiBodyDto, ApiSuccessResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from 'src/swagger/decorators';
import { ApiErrorResponseDto, ApiSuccessResponseDto } from 'src/dto/common.swagger.dto';`;
}

// Main function to process all controllers
async function processControllers() {
  try {
    console.log('Starting Swagger documentation generation...');
    
    // Find all controller files
    const controllerFiles = findControllerFiles(MODULES_DIR);
    console.log(`Found ${controllerFiles.length} controller files`);
    
    for (const filePath of controllerFiles) {
      console.log(`Processing ${filePath}...`);
      
      // Parse the controller file
      const sourceFile = parseTypeScriptFile(filePath);
      
      // Extract controller name from file path
      const fileName = path.basename(filePath);
      const controllerName = fileName.replace(CONTROLLER_SUFFIX, '');
      
      // Extract methods from the controller
      const methods = extractControllerMethods(sourceFile);
      console.log(`Found ${methods.length} methods in ${controllerName}`);
      
      // TODO: Generate Swagger decorators for each method
      // This part would modify the source file to add the decorators
      // For now, we'll just log what would be added
      
      for (const method of methods) {
        if (!method.hasSwaggerDecorators) {
          const decorators = generateSwaggerDecorators(method, controllerName);
          console.log(`\nWould add to ${method.name}:`);
          console.log(decorators);
        } else {
          console.log(`${method.name} already has Swagger decorators`);
        }
      }
    }
    
    console.log('\nSwagger documentation generation complete!');
    console.log('Note: This script only analyzes controllers. You need to manually add the decorators.');
    console.log('Use the output above as a guide for adding decorators to each controller method.');
    
  } catch (error) {
    console.error('Error processing controllers:', error);
  }
}

// Run the script
processControllers();