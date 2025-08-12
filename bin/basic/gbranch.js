#!/usr/bin/env node

/**
 * gbranch - Enhanced Git Branch Management
 * 
 * Features:
 * - Comprehensive branch listing with colors
 * - Safe branch creation with validation
 * - Current branch highlighting
 * - Remote branch tracking information
 * - Branch switching recommendations
 * 
 * Usage:
 *   gbranch                    - List all branches
 *   gbranch "new-branch"       - Create new branch
 *   gbranch --remote           - Show remote branches
 *   gbranch --all              - Show local and remote branches
 *   gbranch --help             - Show this help
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
🌿 gbranch - Enhanced Git Branch Management
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gbranch')}                      ${chalk.gray('# List all local branches')}`);
  console.log(`   ${chalk.green('gbranch "new-branch"')}         ${chalk.gray('# Create new branch')}`);
  console.log(`   ${chalk.green('gbranch --remote')}             ${chalk.gray('# Show remote branches')}`);
  console.log(`   ${chalk.green('gbranch --all')}                ${chalk.gray('# Show local and remote branches')}`);
  console.log(`   ${chalk.green('gbranch --merged')}             ${chalk.gray('# Show merged branches only')}`);
  console.log(`   ${chalk.green('gbranch --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Listing:')} Current branch highlighted in green`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safe Creation:')} Validates branch names and checks duplicates`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Remote Tracking:')} Shows upstream branch relationships`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Info:')} Last commit dates and authors`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Quick Switching:')} Recommendations for branch navigation`);
  
  console.log(chalk.cyan('\n💡 BRANCH CREATION:'));
  console.log(`   ${chalk.blue('Valid Names:')} feature/login, bugfix/header, hotfix/security`);
  console.log(`   ${chalk.blue('Conventions:')} Use descriptive names with prefixes`);
  console.log(`   ${chalk.blue('Best Practice:')} Keep names short but meaningful`);
  
  console.log(chalk.cyan('\n⚡ COMMON WORKFLOW:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gbranch "feature/new-page"')} - Create feature branch`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gcheckout feature/new-page')} - Switch to new branch`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gbranch')} - List branches to verify`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gbranch --merged')} - Check merged branches`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Validate branch name
function validateBranchName(branchName) {
  if (!branchName || branchName.trim() === '') {
    return { valid: false, reason: 'Branch name cannot be empty' };
  }
  
  // Check for invalid characters
  const invalidChars = /[~^:?*[\\\s]/;
  if (invalidChars.test(branchName)) {
    return { valid: false, reason: 'Branch name contains invalid characters (spaces, ~, ^, :, ?, *, [, \\)' };
  }
  
  // Check if it starts with a dot or hyphen
  if (branchName.startsWith('.') || branchName.startsWith('-')) {
    return { valid: false, reason: 'Branch name cannot start with . or -' };
  }
  
  return { valid: true };
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

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
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
    // Check if creating a new branch
    const branchName = args.find(arg => !arg.startsWith('--'))?.trim();
    const showRemote = args.includes('--remote') || args.includes('-r');
    const showAll = args.includes('--all') || args.includes('-a');
    const showMerged = args.includes('--merged');
    
    if (branchName) {
      // Create new branch
      console.log(chalk.bold.magenta('\n🌿 Creating New Branch'));
      console.log(chalk.gray('─'.repeat(40)));
      
      // Validate branch name
      const validation = validateBranchName(branchName);
      if (!validation.valid) {
        console.log(chalk.red(`❌ Invalid branch name: ${validation.reason}`));
        console.log(chalk.yellow('💡 Use descriptive names like: feature/login, bugfix/header'));
        process.exit(1);
      }
      
      // Check if branch already exists
      if (branchExists(branchName)) {
        console.log(chalk.red(`❌ Branch "${branchName}" already exists`));
        console.log(chalk.yellow(`💡 Switch to it with: ${chalk.green(`gcheckout ${branchName}`)}`));
        process.exit(1);
      }
      
      console.log(chalk.blue('🔍 Validating:'), chalk.white(branchName));
      console.log(chalk.blue('📍 Based on:'), chalk.white(getCurrentBranch() || 'HEAD'));
      
      // Create the branch
      runGitCommand(`git branch ${branchName}`, `Branch "${branchName}" created successfully`);
      
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.gray(`   • Switch to branch: ${chalk.green(`gcheckout ${branchName}`)}`));
      console.log(chalk.gray(`   • Push to remote: ${chalk.green(`gpush -u origin ${branchName}`)}`));
      console.log(chalk.gray(`   • List all branches: ${chalk.green('gbranch')}`));
      
    } else {
      // List branches
      console.log(chalk.bold.magenta('\n🌿 Git Branches'));
      console.log(chalk.gray('─'.repeat(40)));
      
      let command = 'git branch -v';
      if (showAll) {
        command = 'git branch -av';
        console.log(chalk.blue('📊 Showing:'), chalk.white('All branches (local + remote)'));
      } else if (showRemote) {
        command = 'git branch -rv';
        console.log(chalk.blue('📊 Showing:'), chalk.white('Remote branches only'));
      } else if (showMerged) {
        command = 'git branch --merged';
        console.log(chalk.blue('📊 Showing:'), chalk.white('Merged branches only'));
      } else {
        console.log(chalk.blue('📊 Showing:'), chalk.white('Local branches'));
      }
      
      console.log();
      
      // Execute branch listing command
      execSync(command, { stdio: 'inherit' });
      
      console.log(chalk.cyan('\n💡 Useful commands:'));
      console.log(chalk.gray(`   • Create branch: ${chalk.green('gbranch "branch-name"')}`));
      console.log(chalk.gray(`   • Switch branch: ${chalk.green('gcheckout branch-name')}`));
      console.log(chalk.gray(`   • Show all branches: ${chalk.green('gbranch --all')}`));
      console.log(chalk.gray(`   • Delete branch: ${chalk.green('git branch -d branch-name')}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Branch operation failed!'));
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
