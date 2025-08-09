#!/usr/bin/env node

/**
 * gcheckout - Enhanced Git Checkout Alias
 * 
 * Usage:
 *   gcheckout "branch-name"    - Switch to existing branch
 *   gcheckout -b "new-branch"  - Create and switch to new branch
 *   gcheckout -h, --help       - Show help
 *   gcheckout --list           - List available branches first
 * 
 * Features:
 * - Repository context validation
 * - Branch switching and creation
 * - Safety checks
 */

import { spawn } from 'child_process';
import path from 'path';
import { validateRepository, showHelp } from '../advanced/common';

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  showHelp(
    'gcheckout',
    'Enhanced Git Branch Checkout',
    `  gcheckout "branch-name"    Switch to existing branch
  gcheckout -b "new-branch"  Create and switch to new branch
  gcheckout --list           List available branches first
  gcheckout -h, --help       Show this help`,
    [
      'gcheckout "main"           # Switch to main branch',
      'gcheckout -b "feature/new" # Create and switch to new branch',
      'gcheckout --list          # See available branches'
    ]
  );
  process.exit(0);
}

// List branches if requested
if (args.includes('--list')) {
  console.log('🌿 Available branches:');
  const listProcess = spawn('node', [path.join(__dirname, '..', '..', 'mcp-cli.js'), 'git-branch'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  listProcess.on('close', (code) => {
    console.log('\n💡 Use: gcheckout "branch-name" to switch');
    process.exit(code);
  });
  return;
}

// Validate repository
if (!validateRepository('checkout')) {
  process.exit(1);
}

// Validate arguments
if (args.length === 0) {
  console.error('❌ Error: Branch name is required');
  console.log('💡 Usage: gcheckout "branch-name"');
  console.log('💡 Or: gcheckout --list to see available branches');
  process.exit(1);
}

// Determine if creating new branch
const createNew = args.includes('-b');
const branchName = createNew ? args[args.indexOf('-b') + 1] : args[0];

if (!branchName) {
  console.error('❌ Error: Branch name is required');
  process.exit(1);
}

console.log(`🌿 ${createNew ? 'Creating and switching to' : 'Switching to'} branch: "${branchName}"`);

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');

const mcpProcess = spawn('node', [mcpCliPath, 'git-checkout', branchName, createNew.toString()], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  if (code === 0) {
    console.log('💡 Tip: Use "gstatus" to see your current repository state');
  }
  process.exit(code);
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
