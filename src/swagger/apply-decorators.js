const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Modules directory
const modulesDir = path.join(__dirname, '..', 'Modules');

// Function to recursively find all controller files
async function findControllerFiles(dir) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const controllers = [];

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const nestedControllers = await findControllerFiles(filePath);
      controllers.push(...nestedControllers);
    } else if (file.name.endsWith('.controller.ts')) {
      controllers.push(filePath);
    }
  }

  return controllers;
}

// Function to add ApiControllerTag decorator to a controller file
async function addApiControllerTagToFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    
    // Skip if already has ApiControllerTag
    if (content.includes('ApiControllerTag')) {
      console.log(`Skipping ${filePath} - already has ApiControllerTag`);
      return;
    }
    
    // Extract module name from file path
    const pathParts = filePath.split(path.sep);
    const moduleIndex = pathParts.findIndex(part => part === 'Modules');
    const moduleName = pathParts[moduleIndex + 1];
    
    // Get controller name from filename
    const fileName = path.basename(filePath, '.controller.ts');
    const tagName = `${moduleName}-${fileName}`;
    
    // Add import statement
    let modifiedContent = content;
    
    // Check if we need to add the import
    if (!modifiedContent.includes('from \'src/swagger/decorators\'')) {
      // Find the last import statement
      const importRegex = /import[\s\S]*?from\s+['"].*?['"]\s*;/g;
      const imports = [...modifiedContent.matchAll(importRegex)];
      
      if (imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const insertPosition = lastImport.index + lastImport[0].length;
        
        modifiedContent = 
          modifiedContent.slice(0, insertPosition) + 
          '\nimport { ApiControllerTag } from \'src/swagger/decorators\';\n' + 
          modifiedContent.slice(insertPosition);
      }
    }
    
    // Add decorator before @Controller
    const controllerRegex = /@Controller\([^)]*\)/;
    modifiedContent = modifiedContent.replace(
      controllerRegex, 
      `@ApiControllerTag('${tagName}')\n$&`
    );
    
    // Write the modified content back to the file
    await writeFileAsync(filePath, modifiedContent, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function
async function main() {
  try {
    const controllerFiles = await findControllerFiles(modulesDir);
    console.log(`Found ${controllerFiles.length} controller files`);
    
    for (const file of controllerFiles) {
      await addApiControllerTagToFile(file);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();