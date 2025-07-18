#!/usr/bin/env node

// Test the git-add-all tool
const { spawn } = require('child_process');
const path = require('path');

console.log('Using git-add-all tool to add all files...');

const testMessage = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "git-add-all",
    arguments: {}
  }
};

const serverPath = path.join(__dirname, 'dist', 'index.js');
const child = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

child.stdin.write(JSON.stringify(testMessage) + '\n');
child.stdin.end();

let output = '';
child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

child.on('close', (code) => {
  console.log('MCP Server Output:', output);
  console.log('Exit code:', code);
  console.log('All files added successfully!');
});

setTimeout(() => {
  child.kill();
}, 5000);
