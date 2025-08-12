#!/usr/bin/env node

/**
 * gstatus - Enhanced Git Status with Beautiful Styling
 * 
 * Features:
 * - Beautiful colored status display
 * - Branch information with ahead/behind counts
 * - Categorized file changes (staged, modified, untracked)
 * - Repository health indicators
 * - Remote status information
 * 
 * Usage:
 *   gstatus                 - Show enhanced repository status
 *   gstatus --simple        - Show simple git status
 *   gstatus --help, -h      - Show this help
 */

import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';

// Check if we're in a git repository
function validateRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Error: Not a git repository'));
    console.log(chalk.yellow('💡 Initialize with: git init'));
    return false;
  }
}

// Parse git status output into structured data
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
      if (statusCode === '??') {
        status.untracked.push(filename);
      } else {
        if (statusCode[0] !== ' ') {
          // Staged changes
          if (statusCode[0] === 'A') status.staged.push({file: filename, type: 'added'});
          else if (statusCode[0] === 'M') status.staged.push({file: filename, type: 'modified'});
          else if (statusCode[0] === 'D') status.staged.push({file: filename, type: 'deleted'});
          else if (statusCode[0] === 'R') status.renamed.push(filename);
          else status.staged.push({file: filename, type: 'staged'});
        }
        
        if (statusCode[1] === 'M') {
          status.modified.push(filename);
        } else if (statusCode[1] === 'D') {
          status.deleted.push(filename);
        }
      }
    }
  }

  return status;
}

// Display enhanced status with beautiful styling
function displayStatus(status) {
  console.log(chalk.bold.cyan('\n📊 Repository Status'));
  console.log(chalk.gray('═'.repeat(50)));
  
  // Branch information
  console.log(chalk.blue('🌿 Branch:'), chalk.white.bold(status.branch));
  
  // Remote sync status
  if (status.ahead > 0 || status.behind > 0) {
    if (status.ahead > 0) {
      console.log(chalk.green(`⬆️  Ahead:  ${status.ahead} commit(s) ready to push`));
    }
    if (status.behind > 0) {
      console.log(chalk.yellow(`⬇️  Behind: ${status.behind} commit(s) need to pull`));
    }
  } else {
    console.log(chalk.green('✅ Up to date with remote'));
  }
  
  console.log(); // Empty line
  
  // Working directory status
  let hasChanges = false;
  
  // Staged changes
  if (status.staged.length > 0) {
    hasChanges = true;
    console.log(chalk.green.bold('📦 Staged Changes (ready to commit):'));
    status.staged.forEach(item => {
      const typeIcon = item.type === 'added' ? '➕' : item.type === 'modified' ? '🔧' : item.type === 'deleted' ? '🗑️' : '📝';
      console.log(chalk.green(`   ${typeIcon} ${item.file}`));
    });
    console.log();
  }
  
  // Modified files
  if (status.modified.length > 0) {
    hasChanges = true;
    console.log(chalk.yellow.bold('🔧 Modified Files (not staged):'));
    status.modified.forEach(file => {
      console.log(chalk.yellow(`   📝 ${file}`));
    });
    console.log();
  }
  
  // Deleted files
  if (status.deleted.length > 0) {
    hasChanges = true;
    console.log(chalk.red.bold('🗑️  Deleted Files:'));
    status.deleted.forEach(file => {
      console.log(chalk.red(`   ❌ ${file}`));
    });
    console.log();
  }
  
  // Untracked files
  if (status.untracked.length > 0) {
    hasChanges = true;
    console.log(chalk.blue.bold('📄 Untracked Files:'));
    status.untracked.forEach(file => {
      console.log(chalk.blue(`   ➕ ${file}`));
    });
    console.log();
  }
  
  // Renamed files
  if (status.renamed.length > 0) {
    hasChanges = true;
    console.log(chalk.magenta.bold('🔄 Renamed Files:'));
    status.renamed.forEach(file => {
      console.log(chalk.magenta(`   🔄 ${file}`));
    });
    console.log();
  }
  
  // Clean status
  if (!hasChanges) {
    console.log(chalk.green.bold('✨ Working directory clean'));
    console.log(chalk.gray('   No changes to commit'));
    console.log();
  }
  
  // Quick action suggestions
  if (hasChanges) {
    console.log(chalk.cyan.bold('💡 Quick Actions:'));
    if (status.modified.length > 0 || status.untracked.length > 0) {
      console.log(chalk.gray(`   ${chalk.green('gadd')} - Stage all changes`));
    }
    if (status.staged.length > 0) {
      console.log(chalk.gray(`   ${chalk.green('gcommit "message"')} - Commit staged changes`));
    }
    if (status.behind > 0) {
      console.log(chalk.gray(`   ${chalk.green('gpull')} - Pull latest changes`));
    }
    if (status.ahead > 0) {
      console.log(chalk.gray(`   ${chalk.green('gpush')} - Push commits to remote`));
    }
    console.log(chalk.gray(`   ${chalk.green('gflow "message"')} - Complete workflow (add → commit → push)`));
    console.log();
  }
}

// Show help information
function showHelp() {
  console.log(chalk.bold.cyan(`
📊 gstatus - Enhanced Git Status Display
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gstatus')}                    ${chalk.gray('# Show enhanced repository status')}`);
  console.log(`   ${chalk.green('gstatus --simple')}           ${chalk.gray('# Show basic git status output')}`);
  console.log(`   ${chalk.green('gstatus --help')}             ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Beautiful Color Coding:')} Different colors for different file states`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Information:')} Current branch with remote sync status`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Categorized Changes:')} Staged, modified, untracked files`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Quick Actions:')} Suggested next commands based on status`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Clean Display:')} Easy to read repository health`);
  
  console.log(chalk.cyan('\n💡 STATUS ICONS:'));
  console.log(`   ${chalk.green('📦')} ${chalk.white('Staged Changes')} - Ready to commit`);
  console.log(`   ${chalk.yellow('🔧')} ${chalk.white('Modified Files')} - Changes not staged`);
  console.log(`   ${chalk.blue('📄')} ${chalk.white('Untracked Files')} - New files not in Git`);
  console.log(`   ${chalk.red('🗑️ ')} ${chalk.white('Deleted Files')} - Removed files`);
  console.log(`   ${chalk.magenta('🔄')} ${chalk.white('Renamed Files')} - Files moved or renamed`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  // Validate repository
  if (!validateRepository()) {
    process.exit(1);
  }
  
  try {
    // Simple mode - just show regular git status
    if (args.includes('--simple')) {
      console.log(chalk.cyan('📋 Simple Git Status:'));
      console.log(chalk.gray('─'.repeat(30)));
      const result = execSync('git status', { encoding: 'utf8' });
      console.log(result);
      return;
    }
    
    // Enhanced mode - show beautiful styled status
    const statusOutput = execSync('git status --porcelain -b', { encoding: 'utf8' });
    const status = parseGitStatus(statusOutput);
    displayStatus(status);
    
  } catch (error) {
    console.log(chalk.red('❌ Error getting repository status:'), error.message);
    process.exit(1);
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Unexpected error:'), error.message);
    process.exit(1);
  });
}
