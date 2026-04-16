import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistPath = path.join(__dirname, '../frontend/dist');
const indexHtmlPath = path.join(frontendDistPath, 'index.html');

console.log('--- Deployment Diagnostic ---');
console.log(`Working Directory: ${process.cwd()}`);
console.log(`Checking for frontend build at: ${indexHtmlPath}`);

if (!fs.existsSync(indexHtmlPath)) {
  console.log('⚠️  Frontend build MISSING. Starting self-healing build process...');
  
  try {
    const rootPath = path.resolve(__dirname, '..');
    console.log(`Root Path resolved to: ${rootPath}`);
    
    // Check if package.json exists in subfolders to verify pathing
    const frontendPath = path.join(rootPath, 'frontend');
    console.log(`Frontend Directory Exists: ${fs.existsSync(frontendPath)}`);
    
    console.log('Starting execution of build command...');
    
    // Execute the build command from the root
    execSync('npm run build', { 
      cwd: rootPath, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 300000 // 5 minute timeout for safety
    });
    
    if (fs.existsSync(indexHtmlPath)) {
      console.log('✅ Self-healing build completed successfully! dist folder is now present.');
    } else {
      console.error('❌ Build script finished but dist/index.html is STILL missing.');
    }
  } catch (error) {
    console.error('❌ Self-healing build FAILED during execution.');
    console.error(`Error Details: ${error.message}`);
    // If it's a timeout error, it will show up here
  }
} else {
  console.log('✅ Frontend build found. Skipping build step.');
}

console.log('-----------------------------');
