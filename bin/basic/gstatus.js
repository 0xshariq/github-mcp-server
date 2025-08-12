#!/usr/bin/env node

/**
 * gstatus - Enhanced Git Status Alias
 * 
 * Usage:
 *   gstatus                 - Show repository status with styled output
 *   gstatus --help, -h      - Show this help
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

function parseGitStatus(output) {
  const lines = output.split('\n').filter(line => line.trim());
  const status = {
    branch: '',
    ahead: 0,
    behind: 0,
    staged: [],
    modified: [],
    untracked: [],
    deleted: [],
    renamed: []
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Branch info line
      const branchMatch = line.match(/## (.+?)(?:\.\.\.|$)/);
      if (branchMatch) {
        status.branch = branchMatch[1];
      }
      
      const aheadMatch = line.match(/ahead (\d+)/);
      const behindMatch = line.match(/behind (\d+)/);
      
      if (aheadMatch) status.ahead = parseInt(aheadMatch[1]);
      if (behindMatch) status.behind = parseInt(behindMatch[1]);
      
    } else if (line.length >= 3) {
      const statusCode = line.substring(0, 2);
      const filename = line.substring(3);
      
      // Parse file status codes
      if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
        // Staged changes
        if (statusCode[0] === 'A') status.staged.push({file: filename, type: 'added'});
        else if (statusCode[0] === 'M') status.staged.push({file: filename, type: 'modified'});
        else if (statusCode[0] === 'D') status.staged.push({file: filename, type: 'deleted'});
        else if (statusCode[0] === 'R') status.renamed.push(filename);
        else status.staged.push({file: filename, type: 'staged'});
      }
      
      if (statusCode[1] !== ' ') {
        // Working directory changes
        if (statusCode[1] === 'M') status.modified.push(filename);
        else if (statusCode[1] === 'D') status.deleted.push(filename);
      }
      
      if (statusCode === '??') {
        status.untracked.push(filename);
      }
    }
  }
  
  return status;
}

async function getStyledStatus() {
  try {
    // Get git status in porcelain format
    const statusOutput = execSync('git status --porcelain=v1 -b', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    const status = parseGitStatus(statusOutput);
    
    // Show repository context
    console.log(chalk.bold.cyan('📊 Repository Status'));
    console.log(chalk.dim('═'.repeat(50)));
    console.log();
    
    // Branch information
    console.log(chalk.bold.yellow('🌿 Branch:'), chalk.green.bold(status.branch || 'unknown'));
    
    if (status.ahead > 0 || status.behind > 0) {
      let syncStatus = '';
      if (status.ahead > 0) syncStatus += chalk.green(`↑${status.ahead} ahead`);
      if (status.behind > 0) {
        if (syncStatus) syncStatus += ', ';
        syncStatus += chalk.red(`↓${status.behind} behind`);
      }
      console.log(chalk.bold.yellow('🔄 Sync:'), syncStatus);
    }
    console.log();
    
    // File changes
    let hasChanges = false;
    
    // Staged changes
    if (status.staged.length > 0) {
      hasChanges = true;
      console.log(chalk.bold.green('✅ Staged Changes:'));
      status.staged.forEach(item => {
        const icon = item.type === 'added' ? '📄' : item.type === 'modified' ? '📝' : item.type === 'deleted' ? '🗑️' : '📋';
        console.log(`   ${icon} ${chalk.green(item.file)} ${chalk.gray(`(${item.type})`)}`);
      });
      console.log();
    }
    
    // Modified files
    if (status.modified.length > 0) {
      hasChanges = true;
      console.log(chalk.bold.yellow('📝 Modified Files:'));
      status.modified.forEach(file => {
        console.log(`   📝 ${chalk.yellow(file)}`);
      });
      console.log();
    }
    
    // Deleted files
    if (status.deleted.length > 0) {
      hasChanges = true;
      console.log(chalk.bold.red('🗑️  Deleted Files:'));
      status.deleted.forEach(file => {
        console.log(`   🗑️ ${chalk.red(file)}`);
      });
      console.log();
    }
    
    // Untracked files
    if (status.untracked.length > 0) {
      hasChanges = true;
      console.log(chalk.bold.gray('❓ Untracked Files:'));
      status.untracked.forEach(file => {
        console.log(`   ❓ ${chalk.gray(file)}`);
      });
      console.log();
    }
    
    // Renamed files
    if (status.renamed.length > 0) {
      hasChanges = true;
      console.log(chalk.bold.blue('🔄 Renamed Files:'));
      status.renamed.forEach(file => {
        console.log(`   🔄 ${chalk.blue(file)}`);
      });
      console.log();
    }
    
    // Clean status
    if (!hasChanges) {
      console.log(chalk.bold.green('✨ Working tree clean'));
      console.log(chalk.gray('No changes to commit'));
      console.log();
    }
    
    // Next steps suggestions
    console.log(chalk.bold.cyan('💡 Suggested Next Steps:'));
    if (status.untracked.length > 0 || status.modified.length > 0 || status.deleted.length > 0) {
      console.log(chalk.cyan('   • Add changes: ') + chalk.white('gadd .'));
    }
    if (status.staged.length > 0) {
      console.log(chalk.cyan('   • Commit changes: ') + chalk.white('gcommit "your message"'));
    }
    if (status.ahead > 0) {
      console.log(chalk.cyan('   • Push commits: ') + chalk.white('gpush'));
    }
    if (status.behind > 0) {
      console.log(chalk.cyan('   • Pull changes: ') + chalk.white('gpull'));
    }
    if (!hasChanges && status.ahead === 0 && status.behind === 0) {
      console.log(chalk.cyan('   • Start working: ') + chalk.gray('Edit files and make changes'));
    }
    
  } catch (error) {
    console.error(chalk.red.bold('❌ Error getting git status:'), error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gstatus', 'Enhanced Git Status', [
      'gstatus                 Show repository status with styled output',
      'gstatus --help, -h      Show this help'
    ], [
      'gstatus                 # Show complete styled status',
      'gstatus                 # See branch, changes, and suggestions'
    ], [
      '• Repository context validation',
      '• Styled file change display',
      '• Branch and sync information',
      '• Helpful next-step suggestions'
    ], '📊');
    return;
  }

  // Validate repository
  if (!validateRepository('status')) {
    process.exit(1);
  }

  // Get and display styled status
  await getStyledStatus();
}

// ESM module detection
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
