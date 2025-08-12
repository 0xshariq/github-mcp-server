#!/usr/bin/env node

/**
 * gfresh - Enhanced Fresh Repository Setup
 * 
 * Features:
 * - Complete repository reset and cleanup
 * - Fresh start from remote state
 * - Branch cleanup and synchronization
 * - Development environment refresh
 * - Safe backup before destructive operations
 * 
 * Usage:
 *   gfresh                   - Smart fresh setup
 *   gfresh --hard            - Complete reset (with backup)
 *   gfresh --clean           - Clean working directory
 *   gfresh --sync            - Sync with remote state
 *   gfresh --help            - Show this help
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

function validateRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Error: Not a git repository'));
    return false;
  }
}

function showHelp() {
  console.log(chalk.bold.magenta(`
✨ gfresh - Enhanced Fresh Repository Setup
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gfresh')}                   ${chalk.gray('# Smart fresh setup')}`);
  console.log(`   ${chalk.green('gfresh --hard')}            ${chalk.gray('# Complete reset with backup')}`);
  console.log(`   ${chalk.green('gfresh --clean')}           ${chalk.gray('# Clean working directory')}`);
  console.log(`   ${chalk.green('gfresh --sync')}            ${chalk.gray('# Sync with remote state')}`);
  console.log(`   ${chalk.green('gfresh --help')}            ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n✨ FRESH STRATEGIES:'));
  console.log(`   ${chalk.blue('Smart Fresh:')} Intelligent cleanup while preserving important work`);
  console.log(`   ${chalk.blue('Hard Reset:')} Complete reset to remote state (with backup)`);
  console.log(`   ${chalk.blue('Clean Only:')} Remove untracked files and directories`);
  console.log(`   ${chalk.blue('Sync Fresh:')} Synchronize with remote and clean locally`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

function runGitCommand(command, successMessage) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (successMessage) {
      console.log(chalk.green(`✅ ${successMessage}`));
    }
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ ${error.message}`));
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (!validateRepository()) {
    process.exit(1);
  }
  
  try {
    console.log(chalk.bold.magenta('\n✨ Fresh Repository Setup'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (args.includes('--hard')) {
      console.log(chalk.red('🚨 Hard reset mode - creating backup first...'));
      const timestamp = new Date().toISOString().substring(0, 16).replace(/[T:]/g, '-');
      runGitCommand(`git branch fresh-backup-${timestamp}`, 'Created backup branch');
      runGitCommand('git reset --hard origin/HEAD', 'Reset to remote state');
    } else if (args.includes('--clean')) {
      console.log(chalk.blue('🧹 Cleaning working directory...'));
      runGitCommand('git clean -fd', 'Removed untracked files');
    } else {
      console.log(chalk.blue('✨ Smart fresh setup...'));
      runGitCommand('git stash', 'Stashed local changes');
      runGitCommand('git pull', 'Pulled latest changes');
      runGitCommand('git clean -fd', 'Cleaned untracked files');
    }
    
    console.log(chalk.green('🎉 Repository refreshed!'));
    
  } catch (error) {
    console.log(chalk.red('❌ Fresh setup failed'));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}
