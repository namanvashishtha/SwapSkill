#!/usr/bin/env node

import { networkInterfaces } from 'os';
import { spawn } from 'child_process';

// Function to get local IP address
function getLocalIPAddress() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIPAddress();
const port = process.env.PORT || 3000;

console.log('\n🌐 Starting SkillSwap on Local Network...\n');
console.log('📍 Network Access Information:');
console.log(`   Local:    http://localhost:${port}`);
console.log(`   Network:  http://${localIP}:${port}`);
console.log('\n📱 To access from other devices:');
console.log(`   1. Connect devices to the same WiFi network`);
console.log(`   2. Open: http://${localIP}:${port}`);
console.log('\n🔥 Starting development server...\n');

// Start the development server
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    HOST: '0.0.0.0',
    PORT: port.toString()
  }
});

child.on('close', (code) => {
  console.log(`\n🛑 Server stopped with code ${code}`);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
});