const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build watch process
const buildWatch = spawn('pnpm', ['exec', 'nest', 'build', '--watch'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

// Watch for dist/apps/backend/src/main.js and fix it
let fixInterval = setInterval(() => {
  const srcMain = path.join(__dirname, 'dist', 'apps', 'backend', 'src', 'main.js');
  const distMain = path.join(__dirname, 'dist', 'main.js');
  
  if (fs.existsSync(srcMain) && !fs.existsSync(distMain)) {
    // Run fix script
    const fixScript = spawn('node', ['fix-dist.js'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    fixScript.on('close', () => {
      // Start the server
      if (!global.serverProcess) {
        global.serverProcess = spawn('node', ['dist/main.js'], {
          stdio: 'inherit',
          shell: true,
          cwd: __dirname
        });
        
        global.serverProcess.on('close', () => {
          global.serverProcess = null;
        });
      }
    });
  }
}, 2000);

// Cleanup on exit
process.on('SIGINT', () => {
  clearInterval(fixInterval);
  if (global.serverProcess) {
    global.serverProcess.kill();
  }
  buildWatch.kill();
  process.exit();
});

