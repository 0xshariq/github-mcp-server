#!/usr/bin/env node

/**
 * gdiff - Enhanced Git Diff with Smart Comparison
 * 
 * Features:
 * - Beautiful diff display with syntax highlighting
 * - Multiple diff modes (unstaged, staged, branch comparison)
 * - File-specific diff viewing
 * - Statistics and change summaries
 * - Side-by-side comparison option
 * 
 * Usage:
 *   gdiff                 - Show unstaged changes
 *   gdiff --cached        - Show staged changes
 *   gdiff "branch"        - Compare with branch
 *   gdiff "file.js"       - Show changes for specific file
 *   gdiff --help          - Show this help
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
📄 gdiff - Enhanced Git Diff with Smart Comparison
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gdiff')}                      ${chalk.gray('# Show unstaged changes')}`);
  console.log(`   ${chalk.green('gdiff --cached')}             ${chalk.gray('# Show staged changes')}`);
  console.log(`   ${chalk.green('gdiff --staged')}             ${chalk.gray('# Same as --cached')}`);
  console.log(`   ${chalk.green('gdiff "branch-name"')}        ${chalk.gray('# Compare with branch')}`);
  console.log(`   ${chalk.green('gdiff "file.js"')}            ${chalk.gray('# Show changes for specific file')}`);
  console.log(`   ${chalk.green('gdiff --stat')}               ${chalk.gray('# Show diff statistics only')}`);
  console.log(`   ${chalk.green('gdiff --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Detection:')} Automatically detects what to compare`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Beautiful Output:')} Color-coded additions and deletions`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Multiple Modes:')} Unstaged, staged, and branch comparisons`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('File-Specific:')} View changes for individual files`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Quick Stats:')} See change summaries and line counts`);
  
  console.log(chalk.cyan('\n💡 COMMON PATTERNS:'));
  console.log(`   ${chalk.blue('Working Changes:')} ${chalk.green('gdiff')} - See unstaged modifications`);
  console.log(`   ${chalk.blue('Review Staged:')} ${chalk.green('gdiff --cached')} - Check what will be committed`);
  console.log(`   ${chalk.blue('Branch Compare:')} ${chalk.green('gdiff "main"')} - See differences from main`);
  console.log(`   ${chalk.blue('File Focus:')} ${chalk.green('gdiff "src/app.js"')} - Specific file changes`);
  console.log(`   ${chalk.blue('Quick Overview:')} ${chalk.green('gdiff --stat')} - Just the statistics`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW TIPS:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gdiff')} - Review your current changes`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gadd file.js')} - Stage specific files`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gdiff --cached')} - Review what will be committed`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gcommit "message"')} - Commit the changes`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
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

// Check if file exists
function fileExists(filename) {
  try {
    execSync(`git ls-files --error-unmatch ${filename}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if branch exists
function branchExists(branchName) {
  try {
    execSync(`git rev-parse --verify ${branchName}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

// Check if there are any changes to diff
function hasChanges(mode = '') {
  try {
    let command = 'git diff --quiet';
    if (mode === 'cached') {
      command = 'git diff --cached --quiet';
    }
    execSync(command, { stdio: 'pipe' });
    return false; // No changes if command succeeds
  } catch (error) {
    return true; // Has changes if command fails
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
    const cachedMode = args.includes('--cached') || args.includes('--staged');
    const statMode = args.includes('--stat');
    const target = args.find(arg => !arg.startsWith('--'))?.trim();
    
    console.log(chalk.bold.magenta('\n📄 Git Diff'));
    console.log(chalk.gray('─'.repeat(40)));
    
    let command = 'git diff';
    let description = 'unstaged changes';
    
    if (cachedMode) {
      command = 'git diff --cached';
      description = 'staged changes (ready to commit)';
    } else if (target) {
      // Check if target is a file or branch
      if (fileExists(target)) {
        command = `git diff ${target}`;
        description = `changes in file: ${target}`;
      } else if (branchExists(target)) {
        command = `git diff ${target}`;
        description = `differences from branch: ${target}`;
      } else {
        console.log(chalk.red(`❌ Target "${target}" is not a valid file or branch`));
        console.log(chalk.yellow('💡 Check available files with:'), chalk.green('gstatus'));
        console.log(chalk.yellow('💡 Check available branches with:'), chalk.green('gbranch'));
        process.exit(1);
      }
    }
    
    if (statMode) {
      command += ' --stat';
      description += ' (statistics only)';
    }
    
    console.log(chalk.blue('📊 Showing:'), chalk.white(description));
    console.log(chalk.blue('📍 Current branch:'), chalk.white(getCurrentBranch() || 'unknown'));
    
    // Check if there are any changes to show
    if (!target && !hasChanges(cachedMode ? 'cached' : '')) {
      if (cachedMode) {
        console.log(chalk.yellow('\n📝 No staged changes'));
        console.log(chalk.cyan('💡 Stage files with:'), chalk.green('gadd <files>'));
      } else {
        console.log(chalk.green('\n✨ No unstaged changes'));
        console.log(chalk.cyan('💡 Working directory is clean'));
      }
      return;
    }
    
    console.log();
    
    // Run the diff command
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      if (error.status === 1) {
        // Git diff returns 1 when there are differences, which is normal
        // Only treat as error if it's a different exit code
      } else {
        throw error;
      }
    }
    
    console.log(chalk.cyan('\n💡 Useful commands:'));
    if (!cachedMode) {
      console.log(chalk.gray(`   • Stage changes: ${chalk.green('gadd <files>')}`));
      console.log(chalk.gray(`   • View staged: ${chalk.green('gdiff --cached')}`));
    }
    if (cachedMode) {
      console.log(chalk.gray(`   • Commit changes: ${chalk.green('gcommit "message"')}`));
      console.log(chalk.gray(`   • Unstage files: ${chalk.green('greset <files>')}`));
    }
    console.log(chalk.gray(`   • Repository status: ${chalk.green('gstatus')}`));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Diff operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('not a git repository')) {
      console.log(chalk.yellow('💡 Initialize repository with: git init'));
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
