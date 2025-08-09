#!/usr/bin/env node

/**
 * gstash - Enhanced Git Stash Alias
 * 
 * Usage:
 *   gstash                - Stash current changes
 *   gstash "message"      - Stash with custom message
 *   gstash --list         - List all stashes
 *   gstash -h, --help     - Show help
 * 
 * Features:
 * - Repository context validation
 * - Custom stash messages
 * - Stash management
 */

import { spawn } from 'child_process';
import path from 'path';
const { validateRepository, showHelp } = require('../advanced/common');

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  showHelp(
    'gstash',
    'Enhanced Git Stash Management',
    `  gstash                Stash current changes
  gstash "message"      Stash with custom message
  gstash --list         List all stashes
  gstash -h, --help     Show this help`,
    [
      'gstash                # Stash current changes',
      'gstash "WIP: feature" # Stash with message',
      'gstash --list         # See all stashes'
    ]
  );
  process.exit(0);
}

// List stashes if requested
if (args.includes('--list')) {
  console.log('💾 Listing all stashes...');
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
if (!validateRepository('stash')) {
  process.exit(1);
}

// Determine stash message
const message = args.join(' ').trim();
if (message) {
  console.log(`💾 Stashing changes with message: "${message}"`);
} else {
  console.log('💾 Stashing current changes...');
}

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');
const mcpArgs = message ? ['git-stash', message] : ['git-stash'];

const mcpProcess = spawn('node', [mcpCliPath, ...mcpArgs], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  if (code === 0) {
    console.log('💡 Tip: Use "gpop" to restore stashed changes later');
  }
  process.exit(code);
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
