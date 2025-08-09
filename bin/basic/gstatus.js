#!/usr/bin/env node

/**
 * gstatus - Enhanced Git Status Alias
 * 
 * Usage:
 *   gstatus                 - Show repository status with context
 *   gstatus -h, --help      - Show help
 *   gstatus --branch        - Show branch information only
 *   gstatus --remote        - Show remote information only
 * 
 * Features:
 * - Repository context (directory, remote, branch)
 * - File change summary
 * - Helpful next-step suggestions
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  console.log();
  console.log(chalk.bold.cyan('📊 gstatus') + chalk.gray(' - ') + chalk.bold.white('Enhanced Git Status'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log();
  
  console.log(chalk.bold.yellow('Usage:'));
  console.log(chalk.green('  gstatus') + chalk.gray('                 Show complete repository status'));
  console.log(chalk.green('  gstatus --branch') + chalk.gray('        Show current branch information'));
  console.log(chalk.green('  gstatus --remote') + chalk.gray('        Show remote repository information'));
  console.log(chalk.green('  gstatus -h, --help') + chalk.gray('      Show this help'));
  console.log();
  
  console.log(chalk.bold.magenta('Features:'));
  console.log(chalk.cyan('  •') + chalk.white(' Repository context (directory, remote URL, current branch)'));
  console.log(chalk.cyan('  •') + chalk.white(' File change summary'));
  console.log(chalk.cyan('  •') + chalk.white(' Helpful next-step suggestions'));
  console.log();
  
  console.log(chalk.bold.blue('Examples:'));
  console.log(chalk.yellow('  gstatus') + chalk.gray('                 Complete status overview'));
  console.log(chalk.yellow('  gstatus --branch') + chalk.gray('        Just branch info'));
  console.log();
  
  console.log(chalk.bold.green('💡 This shows what repository you\'re working in to prevent accidents!'));
  console.log();
  process.exit(0);
}

console.log(chalk.bold.cyan('📊 Checking repository status...'));

// Execute git commands directly in current directory
async function getGitStatus() {
  try {
    const { execSync } = require('child_process');
    
    // Get repository context
    let remote = '', branch = '', status = '';
    
    try {
      remote = execSync('git remote get-url origin', { cwd: process.cwd(), encoding: 'utf8' }).trim();
    } catch (e) {
      remote = 'No remote configured';
    }
    
    try {
      branch = execSync('git branch --show-current', { cwd: process.cwd(), encoding: 'utf8' }).trim();
    } catch (e) {
      branch = 'No branch';
    }
    
    try {
      status = execSync('git status --porcelain', { cwd: process.cwd(), encoding: 'utf8' }).trim();
    } catch (e) {
      status = '';
    }
    
    // Display repository context
    const repoName = process.cwd().split('/').pop();
    console.log(`📁 Directory: ${repoName}`);
    console.log(`🔗 Remote: ${remote}`);
    console.log(`🌿 Branch: ${branch}`);
    console.log('');
    
    // Display status
    console.log('📊 Current repository status:');
    if (status) {
      console.log(status);
    } else {
      console.log('✅ Working tree clean');
    }
    
    console.log('\n💡 Quick commands:');
    console.log('   gadd         - Stage files for commit');
    console.log('   gcommit "msg" - Commit staged files');
    console.log('   gpush        - Push to remote');
    console.log('   gflow "msg"  - Complete workflow (add→commit→push)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getGitStatus();
