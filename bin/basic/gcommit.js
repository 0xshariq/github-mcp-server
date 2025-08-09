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
import chalk from 'chalk';

// Get command line arguments (excluding node and script name)
const args = process.argv.slice(2);

// Help and validation
if (args.includes('-h') || args.includes('--help')) {
  console.log();
  console.log(chalk.bold.cyan('🚀 gcommit') + chalk.gray(' - ') + chalk.bold.white('Enhanced Git Commit'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log();
  
  console.log(chalk.bold.yellow('Usage:'));
  console.log(chalk.green('  gcommit "commit message"') + chalk.gray('    Commit staged files with message'));
  console.log(chalk.green('  gcommit --status') + chalk.gray('           Show repository status first'));
  console.log(chalk.green('  gcommit -h, --help') + chalk.gray('         Show this help'));
  console.log();
  
  console.log(chalk.bold.yellow('Examples:'));
  console.log(chalk.blue('  gcommit "Fix authentication bug"'));
  console.log(chalk.blue('  gcommit "Add new feature for user management"'));
  console.log();
  
  console.log(chalk.bold.magenta('Note:') + chalk.white(' Make sure to stage files with ') + chalk.green('gadd') + chalk.white(' before committing.'));
  console.log();
  process.exit(0);
}



async function main() {
  // Show status first if requested
  if (args.includes('--status')) {
    console.log('📊 Repository Status:');
    const statusProcess = spawn('git', ['status', '--porcelain'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    statusProcess.on('close', (code) => {
      if (code === 0) {
console.log('📝 Use: gcommit "your message" to commit staged files');
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

  // Execute git commit
  console.log(`📝 Committing changes: "${commitMessage}"`);
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
}

// ESM module detection
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}
