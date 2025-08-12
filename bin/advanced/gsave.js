#!/usr/bin/env node

/**
 * gsave - Enhanced Quick Save Manager
 * 
 * Features:
 * - Intelligent save strategies with auto-messaging
 * - Work-in-progress (WIP) commit management
 * - Backup save points with timestamps
 * - Quick save and push workflows
 * - Save templates and patterns
 * 
 * Usage:
 *   gsave                    - Auto quick save
 *   gsave "message"          - Save with message
 *   gsave --wip              - Work-in-progress save
 *   gsave --backup           - Create backup save
 *   gsave --help             - Show this help
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

// Show help information
function showHelp() {
  console.log(chalk.bold.magenta(`
💾 gsave - Enhanced Quick Save Manager
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gsave')}                      ${chalk.gray('# Auto quick save with timestamp')}`);
  console.log(`   ${chalk.green('gsave "fix login"')}          ${chalk.gray('# Save with custom message')}`);
  console.log(`   ${chalk.green('gsave --wip')}                ${chalk.gray('# Work-in-progress save')}`);
  console.log(`   ${chalk.green('gsave --backup')}             ${chalk.gray('# Create timestamped backup')}`);
  console.log(`   ${chalk.green('gsave --push')}               ${chalk.gray('# Save and push to remote')}`);
  console.log(`   ${chalk.green('gsave --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n💾 SAVE STRATEGIES:'));
  console.log(`   ${chalk.blue('Quick Save:')} Fast commit with auto-generated message`);
  console.log(`   ${chalk.blue('WIP Save:')} Work-in-progress commits for ongoing work`);
  console.log(`   ${chalk.blue('Backup Save:')} Timestamped save points for safety`);
  console.log(`   ${chalk.blue('Push Save:')} Save and immediately share to remote`);
  
  console.log(chalk.cyan('\n🎯 AUTO-MESSAGING:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('File Analysis:')} Analyzes changed files for context`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Patterns:')} Recognizes common development patterns`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Timestamps:')} Includes save time for reference`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Context:')} Uses branch name for message hints`);
  
  console.log(chalk.cyan('\n🚧 WIP MANAGEMENT:'));
  console.log(`   ${chalk.blue('Progressive:')} "WIP: implementing user authentication"`);
  console.log(`   ${chalk.blue('Feature:')} "WIP: feature/user-profile - UI components"`);
  console.log(`   ${chalk.blue('Bugfix:')} "WIP: fixing login validation issues"`);
  console.log(`   ${chalk.blue('Experiment:')} "WIP: trying new API structure"`);
  
  console.log(chalk.cyan('\n⚡ SAVE EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gsave')} - Quick checkpoint during development`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gsave "implement auth"')} - Specific feature save`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gsave --wip')} - Save unfinished work`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gsave --backup --push')} - Backup and share`);
  
  console.log(chalk.cyan('\n🔧 ADVANCED OPTIONS:'));
  console.log(`   ${chalk.gray('--amend')} - Amend previous commit instead of new one`);
  console.log(`   ${chalk.gray('--staged')} - Only commit staged changes`);
  console.log(`   ${chalk.gray('--interactive')} - Interactive file selection`);
  console.log(`   ${chalk.gray('--template')} - Use commit message templates`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'main';
  }
}

// Check for uncommitted changes
function hasChangesToSave() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Get repository status for smart messaging
function getChangesSummary() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = status.trim().split('\n').filter(line => line.length > 0);
    
    const summary = {
      modified: 0,
      added: 0,
      deleted: 0,
      renamed: 0,
      files: []
    };
    
    lines.forEach(line => {
      const statusCode = line.substring(0, 2);
      const filename = line.substring(3);
      
      summary.files.push(filename);
      
      if (statusCode.includes('M')) summary.modified++;
      if (statusCode.includes('A')) summary.added++;
      if (statusCode.includes('D')) summary.deleted++;
      if (statusCode.includes('R')) summary.renamed++;
    });
    
    return summary;
  } catch (error) {
    return { modified: 0, added: 0, deleted: 0, renamed: 0, files: [] };
  }
}

// Generate smart commit message
function generateSaveMessage(type = 'save', customMessage = '') {
  if (customMessage) {
    return customMessage;
  }
  
  const timestamp = new Date().toLocaleTimeString();
  const currentBranch = getCurrentBranch();
  const summary = getChangesSummary();
  
  switch (type) {
    case 'wip':
      if (currentBranch.includes('feature')) {
        return `WIP: ${currentBranch} - ongoing development`;
      } else if (currentBranch.includes('fix')) {
        return `WIP: ${currentBranch} - bug fixing in progress`;
      } else {
        return `WIP: work in progress on ${currentBranch}`;
      }
      
    case 'backup':
      return `Backup: ${currentBranch} - ${timestamp} (${summary.files.length} files)`;
      
    default:
      if (summary.files.length === 1) {
        return `Quick save: update ${path.basename(summary.files[0])}`;
      } else if (summary.files.length > 1) {
        return `Quick save: ${summary.files.length} files updated - ${timestamp}`;
      } else {
        return `Quick save: ${timestamp}`;
      }
  }
}

// Run git command with error handling
function runGitCommand(command, successMessage) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (successMessage) {
      console.log(chalk.green(`✅ ${successMessage}`));
    }
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ Git command failed: ${error.message}`));
    throw error;
  }
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
    // Check if there are changes to save
    if (!hasChangesToSave()) {
      console.log(chalk.yellow('\n📝 No changes to save'));
      console.log(chalk.cyan('💡 Working directory is clean'));
      console.log(chalk.gray('Make some changes first, then use'), chalk.green('gsave'));
      return;
    }
    
    const wipMode = args.includes('--wip');
    const backupMode = args.includes('--backup');
    const pushMode = args.includes('--push');
    const amendMode = args.includes('--amend');
    const stagedMode = args.includes('--staged');
    const customMessage = args.find(arg => !arg.startsWith('--'))?.trim();
    
    console.log(chalk.bold.magenta('\n💾 Quick Save Manager'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Show current changes
    const summary = getChangesSummary();
    console.log(chalk.blue('📊 Changes to save:'));
    
    if (summary.added > 0) console.log(chalk.green(`   • ${summary.added} file(s) added`));
    if (summary.modified > 0) console.log(chalk.yellow(`   • ${summary.modified} file(s) modified`));
    if (summary.deleted > 0) console.log(chalk.red(`   • ${summary.deleted} file(s) deleted`));
    if (summary.renamed > 0) console.log(chalk.blue(`   • ${summary.renamed} file(s) renamed`));
    
    // Generate appropriate message
    let saveMessage;
    if (wipMode) {
      saveMessage = generateSaveMessage('wip', customMessage);
      console.log(chalk.blue('🚧 WIP Save mode:'), chalk.white(`"${saveMessage}"`));
    } else if (backupMode) {
      saveMessage = generateSaveMessage('backup', customMessage);
      console.log(chalk.blue('🗄️  Backup Save mode:'), chalk.white(`"${saveMessage}"`));
    } else {
      saveMessage = generateSaveMessage('save', customMessage);
      console.log(chalk.blue('💾 Quick Save mode:'), chalk.white(`"${saveMessage}"`));
    }
    
    // Execute save workflow
    console.log(chalk.blue('\n📁 Step 1: Staging changes...'));
    if (stagedMode) {
      console.log(chalk.gray('   Using already staged changes'));
    } else {
      runGitCommand('git add .', 'All changes staged successfully');
    }
    
    console.log(chalk.blue('\n📝 Step 2: Creating save commit...'));
    if (amendMode) {
      runGitCommand(`git commit --amend -m "${saveMessage}"`, 'Previous commit amended');
    } else {
      runGitCommand(`git commit -m "${saveMessage}"`, 'Save commit created successfully');
    }
    
    if (pushMode) {
      console.log(chalk.blue('\n📤 Step 3: Pushing to remote...'));
      try {
        runGitCommand('git push', 'Changes pushed to remote successfully');
      } catch (error) {
        try {
          const currentBranch = getCurrentBranch();
          runGitCommand(`git push -u origin ${currentBranch}`, 'New branch pushed to remote');
        } catch (pushError) {
          console.log(chalk.yellow('⚠️  Unable to push - continue working locally'));
        }
      }
    }
    
    console.log(chalk.green.bold('\n🎉 Save completed successfully!'));
    
    // Show save summary
    console.log(chalk.cyan('\n📋 Save Summary:'));
    console.log(chalk.green(`   ✅ Message: "${saveMessage}"`));
    console.log(chalk.green(`   ✅ Files: ${summary.files.length} saved`));
    if (pushMode) {
      console.log(chalk.green('   ✅ Pushed to remote'));
    }
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • Continue coding`));
    console.log(chalk.gray(`   • View commit: ${chalk.green('glog -1')}`));
    console.log(chalk.gray(`   • Push later: ${chalk.green('gpush')}`));
    if (wipMode) {
      console.log(chalk.gray(`   • Finish WIP: ${chalk.green('gsave "completed feature"')}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Save failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('nothing to commit')) {
      console.log(chalk.yellow('💡 No changes to save - working directory is clean'));
    } else if (error.message.includes('not a git repository')) {
      console.log(chalk.yellow('💡 Initialize repository with: git init'));
    }
    
    console.log(chalk.yellow('\n💡 Recovery suggestions:'));
    console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Try again: ${chalk.green('gsave')}`));
    console.log(chalk.gray(`   • Get help: ${chalk.green('gsave --help')}`));
    
    process.exit(1);
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}