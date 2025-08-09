#!/usr/bin/env node

/**
 * gquick - Quick Commit Workflow
 * 
 * Usage:
 *   gquick [commit-message]
 *   gquick --help, -h
 * 
 * This combines: add all → commit
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
${colors.cyan}${colors.bright}⚡ gquick - Quick Commit Workflow${colors.reset}

${colors.yellow}Usage:${colors.reset}
  gquick "commit message"     Add all files and commit with message
  gquick                      Add all files and commit with "Auto commit"
  gquick --help, -h           Show this help

${colors.yellow}What it does:${colors.reset}
  ${colors.blue}1.${colors.reset} Adds all modified files (${colors.green}gadd${colors.reset})
  ${colors.blue}2.${colors.reset} Commits with your message (${colors.green}gcommit${colors.reset})

${colors.yellow}Examples:${colors.reset}
  ${colors.green}gquick "Fix navigation bug"${colors.reset}   Add all and commit with message
  ${colors.green}gquick${colors.reset}                        Add all and commit with "Auto commit"

${colors.yellow}Equivalent to:${colors.reset}
  ${colors.green}gadd && gcommit "your message"${colors.reset}
`);
}

// Get the directory where this script is located
const binDir = __dirname;

// Get command line arguments (excluding node and script name)
const args = process.argv.slice(2);

// Check for help flags
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

const commitMessage = args.join(' ') || 'Auto commit';

console.log('🚀 Starting add all → commit workflow...');
console.log('📁 Step 1/2: add...');

// Step 1
const step1Path = path.join(binDir, '..', 'basic', 'gadd.js');
const step1Process = spawn('node', [step1Path], {
  stdio: 'inherit',
  cwd: process.cwd()
});

step1Process.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed at step 1');
    process.exit(code);
  }

  console.log('📄 Step 2/2: commit...');
  
  // Step 2
  const step2Path = path.join(binDir, '..', 'basic', 'gcommit.js');
  const step2Process = spawn('node', [step2Path, commitMessage], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  step2Process.on('close', (code) => {
    if (code === 0) {
      console.log('✅ add all → commit workflow completed!');
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