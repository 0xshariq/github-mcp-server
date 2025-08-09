#!/usr/bin/env node

/**
 * gsync - Enhanced Sync Workflow
 * 
 * Usage:
 *   gsync                   Pull changes and show status
 *   gsync --help, -h        Show help
 */

import { spawn } from 'child_process';
import path from 'path';

// Colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}🔄 gsync - Enhanced Sync Workflow${colors.reset}

${colors.yellow}Usage:${colors.reset}
  gsync              Pull changes from remote and show status
  gsync --help, -h   Show this help

${colors.yellow}What it does:${colors.reset}
  ${colors.blue}1.${colors.reset} Pulls latest changes from remote (${colors.green}gpull${colors.reset})
  ${colors.blue}2.${colors.reset} Shows current repository status (${colors.green}gstatus${colors.reset})

${colors.yellow}Examples:${colors.reset}
  ${colors.green}gsync${colors.reset}              Sync with remote and check status

${colors.yellow}Equivalent to:${colors.reset}
  ${colors.green}gpull && gstatus${colors.reset}

${colors.yellow}Use this when:${colors.reset}
  • Starting work on a shared project
  • Checking what changed after pulling
  • Staying updated with team changes
`);
}

// Get command line arguments
const args = process.argv.slice(2);

// Check for help flags
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Get the directory where this script is located
const binDir = __dirname;

console.log('🔄 Starting pull → status workflow...');
console.log('📁 Step 1/2: pull...');

// Step 1
const step1Path = path.join(binDir, '..', 'basic', 'gpull.js');
const step1Process = spawn('node', [step1Path], {
  stdio: 'inherit',
  cwd: process.cwd()
});

step1Process.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed at step 1');
    process.exit(code);
  }

  console.log('📄 Step 2/2: status...');
  
  // Step 2
  const step2Path = path.join(binDir, '..', 'basic', 'gstatus.js');
  const step2Process = spawn('node', [step2Path], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  step2Process.on('close', (code) => {
    if (code === 0) {
      console.log('✅ pull → status workflow completed!');
    } else {
      console.error('❌ Failed at step 2');
    }
    process.exit(code);
  });

  step2Process.on('error', (err) => {
    console.error('❌ Error executing step 2:', err.message);
    process.exit(1);
  });
});

step1Process.on('error', (err) => {
  console.error('❌ Error executing step 1:', err.message);
  process.exit(1);
});