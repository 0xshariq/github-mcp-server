#!/usr/bin/env node

/**
 * gpop - Enhanced Git Stash Pop Alias
 * 
 * Usage:
 *   gpop                  - Apply most recent stash
 *   gpop -h, --help       - Show help
 *   gpop --list           - List stashes first
 * 
 * Features:
 * - Repository context validation
 * - Safe stash application
 * - Stash listing option
 */

import { spawn } from 'child_process';
import path from 'path';
import { validateRepository, showHelp } from '../advanced/common';

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  showHelp(
    'gpop',
    'Enhanced Git Stash Pop',
    `  gpop                  Apply most recent stash
  gpop --list           List stashes first
  gpop -h, --help       Show this help`,
    [
      'gpop                  # Apply most recent stash',
      'gpop --list           # See available stashes first'
    ]
  );
  process.exit(0);
}

// List stashes if requested
if (args.includes('--list')) {
  console.log('💾 Available stashes:');
  const listProcess = spawn('git', ['stash', 'list'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  listProcess.on('close', (code) => {
    console.log('\n💡 Use "gpop" to apply the most recent stash');
    process.exit(code);
  });
  return;
}

// Validate repository
if (!validateRepository('stash-pop')) {
  process.exit(1);
}

console.log('💾 Applying most recent stash...');

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');

const mcpProcess = spawn('node', [mcpCliPath, 'git-stash-pop'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  if (code === 0) {
    console.log('💡 Tip: Use "gstatus" to see your current changes');
  }
  process.exit(code);
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
