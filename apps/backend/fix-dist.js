const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'dist', 'apps', 'backend', 'src');
const destDir = path.join(__dirname, 'dist');

if (fs.existsSync(srcDir)) {
  // Copy all files from dist/apps/backend/src to dist
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyRecursive(srcDir, destDir);
  
  // Remove the apps directory
  fs.rmSync(path.join(__dirname, 'dist', 'apps'), { recursive: true, force: true });
  
  // Remove packages directory (shared paketi node_modules'dan kullanılacak)
  const packagesDir = path.join(__dirname, 'dist', 'packages');
  if (fs.existsSync(packagesDir)) {
    fs.rmSync(packagesDir, { recursive: true, force: true });
  }
  
  console.log('✓ Fixed dist structure');
} else {
  console.log('✓ Dist structure is already correct');
}

