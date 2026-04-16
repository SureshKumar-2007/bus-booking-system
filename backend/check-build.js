import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistPath = path.join(__dirname, '../frontend/dist');
const indexHtmlPath = path.join(frontendDistPath, 'index.html');

console.log('--- Deployment Diagnostic ---');
console.log(`Checking for frontend build at: ${indexHtmlPath}`);

if (!fs.existsSync(indexHtmlPath)) {
  console.log('⚠️  Frontend build MISSING. Starting self-healing build process...');
  
  try {
    // Run the build command defined in the root package.json
    // We execute it from the root directory (one level up from backend)
    const rootPath = path.join(__dirname, '..');
    
    console.log(`Executing: npm run build in ${rootPath}`);
    
    // Use stdio: 'inherit' to see the build logs in the Render console
    execSync('npm run build', { 
      cwd: rootPath, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('✅ Self-healing build completed successfully!');
  } catch (error) {
    console.error('❌ Self-healing build FAILED:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Frontend build found. Skipping build step.');
}

console.log('-----------------------------');
