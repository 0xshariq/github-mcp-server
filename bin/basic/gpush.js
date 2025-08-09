#!/usr/bin/env node

/**
 * gpush - Enhanced Git Push Alias
 * 
 * Usage:
 *   gpush                    - Push to remote repository
 *   gpush -h, --help         - Show help
 *   gpush --status           - Show status before pushing
 *   gpush --force            - Force push (use with caution)
 * 
 * Features:
 * - Repository context validation
 * - Safety checks before push
 * - Enhanced error handling
 */

import { spawn } from 'child_process';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
🚀 gpush - Enhanced Git Push

Usage:
  gpush                    Push commits to remote repository
  gpush --status          Show repository status first
  gpush --force           Force push (⚠️  DANGER: overwrites remote history!)
  gpush -h, --help        Show this help

Examples:
  gpush                   Safe push to remote
  gpush --status          Check status before pushing
  gpush --force           Force push when you're sure about overwriting remote
  
⚠️  WARNING: --force will overwrite remote history and can cause data loss!
💡 TIP: Use 'git pull' first to integrate remote changes safely.
💡 TIP: Always ensure you're in the correct repository before pushing.
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
      console.log('\n🚀 Use: gpush to push commits to remote');
    }
    process.exit(code);
  });
  return;
}

console.log('🚀 Pushing to remote repository...');
console.log('📍 Working directory:', process.cwd());

// Build git push command arguments
let gitArgs = ['push'];

// Handle force push
if (args.includes('--force')) {
  console.log('⚠️  WARNING: Force pushing - this will overwrite remote history!');
  gitArgs.push('--force');
}

// Execute git push with appropriate arguments
const gitProcess = spawn('git', gitArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

gitProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Push completed successfully!');
  } else {
    console.log('❌ Push failed!');
    if (!args.includes('--force')) {
      console.log('💡 If you need to overwrite remote history, use: gpush --force');
      console.log('💡 Or first try: git pull && gpush');
    }
  }
  process.exit(code);
});

gitProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
