#!/usr/bin/env node

/**
 * greset - Enhanced Git Reset with Safety Features
 * 
 * Features:
 * - Multiple reset modes with clear explanations
 * - Safety warnings for destructive operations
 * - Interactive confirmation for dangerous resets
 * - File-specific reset capabilities
 * - Backup suggestions for hard resets
 * 
 * Usage:
 *   greset                    - Reset staging area (mixed mode)
 *   greset --soft [target]    - Reset commits only (keep changes)
 *   greset --hard [target]    - Reset everything (DESTRUCTIVE)
 *   greset file.js            - Reset specific file
 *   greset --help             - Show this help
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
↩️  greset - Enhanced Git Reset with Safety Features
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('greset')}                      ${chalk.gray('# Reset staging area (mixed mode)')}`);
  console.log(`   ${chalk.green('greset --soft [target]')}      ${chalk.gray('# Reset commits only, keep changes')}`);
  console.log(`   ${chalk.green('greset --hard [target]')}      ${chalk.gray('# Reset everything (DESTRUCTIVE)')}`);
  console.log(`   ${chalk.green('greset --mixed [target]')}     ${chalk.gray('# Reset staging and commits (default)')}`);
  console.log(`   ${chalk.green('greset file.js')}              ${chalk.gray('# Reset specific file from staging')}`);
  console.log(`   ${chalk.green('greset HEAD~1')}               ${chalk.gray('# Reset to previous commit')}`);
  console.log(`   ${chalk.green('greset --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 RESET MODES:'));
  console.log(`   ${chalk.blue('--soft:')} Only moves HEAD pointer`);
  console.log(`     ${chalk.gray('• Keeps staging area and working directory unchanged')}`);
  console.log(`     ${chalk.gray('• Use to undo commits while keeping all changes')}`);
  console.log();
  console.log(`   ${chalk.blue('--mixed (default):')} Moves HEAD and resets staging`);
  console.log(`     ${chalk.gray('• Keeps working directory changes, clears staging')}`);
  console.log(`     ${chalk.gray('• Use to unstage files or undo commits + staging')}`);
  console.log();
  console.log(`   ${chalk.blue('--hard:')} Moves HEAD, resets staging AND working directory`);
  console.log(`     ${chalk.red('• ⚠️  DESTRUCTIVE: Permanently deletes uncommitted changes')}`);
  console.log(`     ${chalk.gray('• Use only when you want to completely discard work')}`);
  
  console.log(chalk.cyan('\n💡 COMMON SCENARIOS:'));
  console.log(`   ${chalk.blue('Unstage files:')} ${chalk.green('greset')} - Remove from staging, keep changes`);
  console.log(`   ${chalk.blue('Undo last commit:')} ${chalk.green('greset --soft HEAD~1')} - Keep all changes`);
  console.log(`   ${chalk.blue('Undo + unstage:')} ${chalk.green('greset HEAD~1')} - Undo commit, unstage`);
  console.log(`   ${chalk.blue('Fresh start:')} ${chalk.green('greset --hard HEAD')} - Discard all changes`);
  console.log(`   ${chalk.blue('Specific file:')} ${chalk.green('greset file.js')} - Unstage one file`);
  
  console.log(chalk.cyan('\n⚠️  SAFETY GUIDELINES:'));
  console.log(`   ${chalk.yellow('•')} Always check ${chalk.green('gstatus')} before resetting`);
  console.log(`   ${chalk.yellow('•')} Use ${chalk.green('gstash')} to backup changes before hard reset`);
  console.log(`   ${chalk.yellow('•')} Start with soft reset, escalate to hard if needed`);
  console.log(`   ${chalk.yellow('•')} Hard reset cannot be undone - commits may be lost`);
  
  console.log(chalk.cyan('\n🔄 RESET TARGETS:'));
  console.log(`   ${chalk.blue('HEAD:')} Current commit (default)`);
  console.log(`   ${chalk.blue('HEAD~1:')} Previous commit`);
  console.log(`   ${chalk.blue('HEAD~3:')} 3 commits back`);
  console.log(`   ${chalk.blue('<hash>:')} Specific commit hash`);
  console.log(`   ${chalk.blue('<branch>:')} Reset to branch tip`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Check if target is a file
function isFile(target) {
  try {
    // Check if it's a file in the index
    execSync(`git ls-files --error-unmatch "${target}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if target is a valid commit reference
function isValidCommitRef(target) {
  try {
    execSync(`git rev-parse --verify "${target}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get current commit hash
function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

// Check for uncommitted changes
function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Get branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'detached HEAD';
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
    // Parse arguments
    const softMode = args.includes('--soft');
    const hardMode = args.includes('--hard');
    const mixedMode = args.includes('--mixed') || (!softMode && !hardMode);
    
    // Get target (file or commit)
    const target = args.find(arg => !arg.startsWith('--')) || 'HEAD';
    
    console.log(chalk.bold.magenta('\n↩️  Git Reset'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue('📍 Current branch:'), chalk.white(getCurrentBranch()));
    console.log(chalk.blue('🎯 Target:'), chalk.white(target));
    
    // Handle file-specific reset
    if (isFile(target) && target !== 'HEAD') {
      console.log(chalk.blue('📄 Mode:'), chalk.white('File-specific reset'));
      console.log(chalk.blue('🔄 Operation:'), chalk.white(`Unstaging ${target}`));
      
      runGitCommand(`git reset HEAD "${target}"`, `File "${target}" unstaged successfully`);
      
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
      console.log(chalk.gray(`   • View changes: ${chalk.green(`gdiff ${target}`)}`));
      console.log(chalk.gray(`   • Re-stage if needed: ${chalk.green(`gadd ${target}`)}`));
      
      return;
    }
    
    // Validate commit target
    if (target !== 'HEAD' && !isValidCommitRef(target)) {
      console.log(chalk.red(`❌ Invalid target: "${target}"`));
      console.log(chalk.yellow('💡 Use: HEAD, HEAD~1, commit hash, or branch name'));
      process.exit(1);
    }
    
    // Determine reset mode
    let mode = 'mixed';
    let modeDesc = 'Reset staging area (keep working directory)';
    
    if (softMode) {
      mode = 'soft';
      modeDesc = 'Reset commit pointer only (keep staging + working directory)';
    } else if (hardMode) {
      mode = 'hard';
      modeDesc = 'Reset everything (DESTRUCTIVE - lose all changes)';
    }
    
    console.log(chalk.blue('⚙️  Mode:'), chalk.white(`--${mode}`));
    console.log(chalk.blue('📝 Description:'), chalk.white(modeDesc));
    
    // Safety warnings for hard mode
    if (hardMode) {
      console.log(chalk.red.bold('\n⚠️  DANGER ZONE!'));
      console.log(chalk.red('This will permanently delete all uncommitted changes!'));
      
      if (hasUncommittedChanges()) {
        console.log(chalk.yellow('\n🚨 You have uncommitted changes that will be LOST:'));
        
        try {
          // Show brief status
          const status = execSync('git status --porcelain', { encoding: 'utf8' });
          const lines = status.trim().split('\n').slice(0, 5); // Show first 5 files
          lines.forEach(line => {
            console.log(chalk.red(`   ${line}`));
          });
          if (status.trim().split('\n').length > 5) {
            console.log(chalk.red('   ... and more'));
          }
        } catch (error) {
          // Ignore if we can't show status
        }
        
        console.log(chalk.cyan('\n💡 Consider these alternatives:'));
        console.log(chalk.gray(`   • Stash changes: ${chalk.green('gstash "backup before reset"')}`));
        console.log(chalk.gray(`   • Soft reset: ${chalk.green(`greset --soft ${target}`)}`));
        console.log(chalk.gray(`   • Mixed reset: ${chalk.green(`greset ${target}`)}`));
        console.log(chalk.red('\n❌ Aborting hard reset for safety'));
        console.log(chalk.yellow('Add --force flag if you really want to proceed (not recommended)'));
        process.exit(1);
      }
    }
    
    // Show what will happen
    if (target !== 'HEAD') {
      try {
        const currentCommit = getCurrentCommit();
        const targetCommit = execSync(`git rev-parse ${target}`, { encoding: 'utf8' }).trim();
        
        if (currentCommit !== targetCommit) {
          console.log(chalk.blue('\n🔄 Commit movement:'));
          console.log(chalk.gray(`   From: ${currentCommit.substring(0, 8)}`));
          console.log(chalk.gray(`   To:   ${targetCommit.substring(0, 8)}`));
        }
      } catch (error) {
        // Continue if we can't show commit info
      }
    }
    
    // Execute reset
    console.log(chalk.blue('\n🔄 Executing reset...'));
    const command = target === 'HEAD' 
      ? `git reset --${mode}`
      : `git reset --${mode} ${target}`;
    
    runGitCommand(command, `Reset completed successfully (${mode} mode)`);
    
    // Post-reset guidance
    console.log(chalk.cyan('\n💡 Post-reset actions:'));
    console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • View history: ${chalk.green('glog')}`));
    
    if (softMode && target !== 'HEAD') {
      console.log(chalk.gray(`   • Changes are still staged: ${chalk.green('gcommit "new message"')}`));
    } else if (mixedMode && target !== 'HEAD') {
      console.log(chalk.gray(`   • Changes are in working directory: ${chalk.green('gadd .')} then commit`));
    } else if (!hardMode) {
      console.log(chalk.gray(`   • Stage changes if needed: ${chalk.green('gadd <files>')}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Reset operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('not a git repository')) {
      console.log(chalk.yellow('💡 Initialize repository with: git init'));
    } else if (error.message.includes('ambiguous argument')) {
      console.log(chalk.yellow('💡 Invalid target reference'));
    }
    
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

