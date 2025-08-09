#!/usr/bin/env node

/**
 * gflow - Enhanced Complete Git Workflow
 * 
 * Usage:
 *   gflow "commit message"       - Complete workflow (add → commit → push)
 *   gflow -h, --help            - Show help
 *   gflow --status              - Show status before workflow
 *   gflow --dry-run "message"    - Preview what will be done
 * 
 * Features:
 * - Repository validation
 * - Safety checks
 * - Step-by-step progress
 */

import { spawn } from 'child_process';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
⚡ gflow - Enhanced Complete Git Workflow

Usage:
  gflow "commit message"      Complete workflow (add → commit → push)
  gflow --status             Show repository status first
  gflow --dry-run "msg"      Preview what will be done (no actual changes)
  gflow -h, --help           Show this help

Examples:
  gflow "Fix authentication bug"
  gflow "Add new feature for users"
  gflow --status
  
What this does:
  1. 📁 Add all modified files (git add .)
  2. 💾 Commit with your message
  3. 🚀 Push to remote repository

⚠️  IMPORTANT: Always verify you're in the correct repository!
💡 Use 'gstatus' to check repository context before running gflow.
`);
  process.exit(0);
}

// Show status first if requested
if (args.includes('--status')) {
  console.log('📊 Repository Status:');
  const statusProcess = spawn('node', [path.join(__dirname, '..', '..', 'mcp-cli.js'), 'git-status'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  statusProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n⚡ Use: gflow "message" to run complete workflow');
    }
    process.exit(code);
  });
  return;
}

// Validate commit message
if (args.length === 0 || (!args.includes('--dry-run') && args.join(' ').trim().length < 3)) {
  console.error('❌ Error: Commit message is required and must be at least 3 characters');
  console.log('💡 Usage: gflow "your commit message"');
  console.log('💡 Or run: gflow --help for more options');
  process.exit(1);
}

const commitMessage = args.includes('--dry-run') 
  ? args.slice(args.indexOf('--dry-run') + 1).join(' ')
  : args.join(' ');

// Dry run mode
if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE - No changes will be made');
  console.log('📍 Working directory:', process.cwd());
  console.log('� Commit message:', `"${commitMessage}"`);
  console.log('\n⚡ This would execute:');
  console.log('  1. 📁 Add all modified files');
  console.log('  2. 💾 Commit with message:', `"${commitMessage}"`);
  console.log('  3. 🚀 Push to remote repository');
  console.log('\n💡 Remove --dry-run to execute the workflow');
  process.exit(0);
}

console.log('⚡ Starting Complete Git Workflow...');
console.log('� Working directory:', process.cwd());
console.log('📝 Commit message:', `"${commitMessage}"`);

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');

const mcpProcess = spawn('node', [mcpCliPath, 'git-flow', commitMessage], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  if (code === 0) {
    console.log('🎉 Git workflow completed successfully!');
  } else {
    console.log('❌ Git workflow failed. Check the errors above.');
  }
  process.exit(code);
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});