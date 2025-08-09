#!/usr/bin/env node

/**
 * gcommit - Enhanced Git Commit Alias
 * 
 * Usage:
 *   gcommit "commit message"           - Commit with message
 *   gcommit -h, --help                - Show help
 *   gcommit --status                   - Show repository status first
 * 
 * Features:
 * - Validates commit message
 * - Shows repository context
 * - Enhanced error handling
 */

import { spawn } from 'child_process';
import path from 'path';

// Get command line arguments (excluding node and script name)
const args = process.argv.slice(2);

// Help and validation
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
🚀 gcommit - Enhanced Git Commit

Usage:
  gcommit "commit message"    Commit staged files with message
  gcommit --status           Show repository status first
  gcommit -h, --help         Show this help

Examples:
  gcommit "Fix authentication bug"
  gcommit "Add new feature for user management"
  
Note: Make sure to stage files with 'gadd' before committing.
`);
  process.exit(0);
}

// Show status first if requested
if (args.includes('--status')) {
  console.log('📊 Repository Status:');
  const statusProcess = spawn('git', ['status', '--porcelain'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  statusProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n📝 Use: gcommit "your message" to commit staged files');
    }
    process.exit(code);
  });
  return;
}

// Validate commit message
if (args.length === 0) {
  console.error('❌ Error: Commit message is required');
  console.log('💡 Usage: gcommit "your commit message"');
  console.log('💡 Or run: gcommit --help for more options');
  process.exit(1);
}

const commitMessage = args.join(' ');
if (commitMessage.trim().length < 3) {
  console.error('❌ Error: Commit message too short (minimum 3 characters)');
  process.exit(1);
}

console.log(`🎯 Committing: "${commitMessage}"`);

// Execute git commit directly
const gitProcess = spawn('git', ['commit', '-m', commitMessage], {
  stdio: 'inherit',
  cwd: process.cwd()
});

gitProcess.on('close', (code) => {
  if (code === 0) {
    console.log('💡 Tip: Use "gpush" to push to remote repository');
  }
  process.exit(code);
});

gitProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
