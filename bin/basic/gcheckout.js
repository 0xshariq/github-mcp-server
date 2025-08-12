#!/usr/bin/env node

/**
 * gcheckout - Enhanced Git Branch Checkout
 * 
 * Features:
 * - Smart branch switching with validation
 * - Create and switch in one command
 * - Uncommitted changes detection
 * - Branch existence verification
 * - Stash management integration
 * 
 * Usage:
 *   gcheckout "branch-name"    - Switch to existing branch
 *   gcheckout -b "new-branch"  - Create and switch to new branch
 *   gcheckout --list           - List available branches
 *   gcheckout --help           - Show this help
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
🔀 gcheckout - Enhanced Git Branch Checkout
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gcheckout "branch-name"')}      ${chalk.gray('# Switch to existing branch')}`);
  console.log(`   ${chalk.green('gcheckout -b "new-branch"')}    ${chalk.gray('# Create and switch to new branch')}`);
  console.log(`   ${chalk.green('gcheckout --list')}             ${chalk.gray('# List available branches')}`);
  console.log(`   ${chalk.green('gcheckout --force')}            ${chalk.gray('# Force checkout (discard local changes)')}`);
  console.log(`   ${chalk.green('gcheckout --help')}             ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Switching:')} Validates branch existence before switching`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Change Detection:')} Warns about uncommitted changes`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Create & Switch:')} One command to create and move to new branch`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Stash Integration:')} Suggests stashing when needed`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Prevents data loss from careless switches`);
  
  console.log(chalk.cyan('\n💡 BRANCH NAMING:'));
  console.log(`   ${chalk.blue('Feature:')} feature/user-auth, feature/payment-system`);
  console.log(`   ${chalk.blue('Bugfix:')} bugfix/header-styling, bugfix/api-timeout`);
  console.log(`   ${chalk.blue('Hotfix:')} hotfix/security-patch, hotfix/critical-bug`);
  console.log(`   ${chalk.blue('Release:')} release/v1.2.0, release/beta-testing`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gcheckout -b "feature/new-page"')} - Start new feature`);
  console.log(`   ${chalk.blue('2.')} Work on your changes...`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gcheckout "main"')} - Switch back to main`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gcheckout "feature/new-page"')} - Continue feature work`);
  
  console.log(chalk.cyan('\n⚠️  SAFETY TIPS:'));
  console.log(`   ${chalk.yellow('•')} Always commit or stash changes before switching`);
  console.log(`   ${chalk.yellow('•')} Use ${chalk.green('gstatus')} to check for uncommitted changes`);
  console.log(`   ${chalk.yellow('•')} Use ${chalk.green('--force')} only when you want to discard changes`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
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

// Check for uncommitted changes
function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// List available branches
function listBranches() {
  try {
    console.log(chalk.bold.magenta('\n🌿 Available Branches'));
    console.log(chalk.gray('─'.repeat(40)));
    execSync('git branch -v', { stdio: 'inherit' });
    
    console.log(chalk.cyan('\n💡 Usage:'));
    console.log(chalk.gray(`   • Switch to branch: ${chalk.green('gcheckout "branch-name"')}`));
    console.log(chalk.gray(`   • Create new branch: ${chalk.green('gcheckout -b "new-branch"')}`));
  } catch (error) {
    console.log(chalk.red('❌ Failed to list branches'));
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
  
  // List branches if requested
  if (args.includes('--list')) {
    if (!validateRepository()) {
      process.exit(1);
    }
    listBranches();
    return;
  }
  
  // Validate repository
  if (!validateRepository()) {
    process.exit(1);
  }
  
  // Validate arguments
  if (args.length === 0) {
    console.log(chalk.red('❌ Error: Branch name is required'));
    console.log(chalk.yellow(`💡 Usage: ${chalk.green('gcheckout "branch-name"')}`));
    console.log(chalk.yellow(`💡 Or: ${chalk.green('gcheckout --list')} to see available branches`));
    process.exit(1);
  }
  
  try {
    const createNew = args.includes('-b');
    const forceCheckout = args.includes('--force') || args.includes('-f');
    
    // Get branch name
    let branchName;
    if (createNew) {
      const bIndex = args.indexOf('-b');
      branchName = args[bIndex + 1];
    } else {
      branchName = args.find(arg => !arg.startsWith('--') && arg !== '-f')?.trim();
    }
    
    if (!branchName) {
      console.log(chalk.red('❌ Error: Branch name is required'));
      console.log(chalk.yellow(`💡 Usage: ${chalk.green('gcheckout "branch-name"')}`));
      process.exit(1);
    }
    
    const currentBranch = getCurrentBranch();
    
    console.log(chalk.bold.magenta('\n🔀 Git Branch Checkout'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue('📍 Current branch:'), chalk.white(currentBranch || 'unknown'));
    console.log(chalk.blue('🎯 Target branch:'), chalk.white(branchName));
    
    // Check if trying to switch to the same branch
    if (!createNew && currentBranch === branchName) {
      console.log(chalk.yellow('⚠️  Already on branch:'), chalk.white(branchName));
      console.log(chalk.cyan('💡 Tip: Use'), chalk.green('gstatus'), chalk.cyan('to see current state'));
      return;
    }
    
    // Check for uncommitted changes (unless force mode)
    if (!forceCheckout && hasUncommittedChanges()) {
      console.log(chalk.yellow('\n⚠️  Uncommitted changes detected!'));
      console.log(chalk.cyan('💡 Options:'));
      console.log(chalk.gray(`   • Commit changes: ${chalk.green('gcommit "commit message"')}`));
      console.log(chalk.gray(`   • Stash changes: ${chalk.green('gstash "work in progress"')}`));
      console.log(chalk.gray(`   • Force checkout: ${chalk.green(`gcheckout --force "${branchName}"`)}`));
      console.log(chalk.red('\n❌ Checkout cancelled to prevent data loss'));
      process.exit(1);
    }
    
    if (createNew) {
      // Create new branch
      console.log(chalk.blue('\n🌿 Creating new branch...'));
      
      // Check if branch already exists
      if (branchExists(branchName)) {
        console.log(chalk.red(`❌ Branch "${branchName}" already exists`));
        console.log(chalk.yellow(`💡 Switch to it with: ${chalk.green(`gcheckout "${branchName}"`)}`));
        process.exit(1);
      }
      
      // Create and switch to new branch
      runGitCommand(`git checkout -b ${branchName}`, `Created and switched to branch "${branchName}"`);
      
    } else {
      // Switch to existing branch
      console.log(chalk.blue('\n🔄 Switching branch...'));
      
      // Check if branch exists
      if (!branchExists(branchName)) {
        console.log(chalk.red(`❌ Branch "${branchName}" does not exist`));
        console.log(chalk.cyan('💡 Available options:'));
        console.log(chalk.gray(`   • Create new branch: ${chalk.green(`gcheckout -b "${branchName}"`)}`));
        console.log(chalk.gray(`   • List branches: ${chalk.green('gcheckout --list')}`));
        process.exit(1);
      }
      
      // Switch to existing branch
      const command = forceCheckout ? `git checkout --force ${branchName}` : `git checkout ${branchName}`;
      runGitCommand(command, `Switched to branch "${branchName}"`);
      
      if (forceCheckout) {
        console.log(chalk.yellow('⚠️  Force checkout completed - local changes were discarded'));
      }
    }
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • See recent commits: ${chalk.green('glog')}`));
    if (createNew) {
      console.log(chalk.gray(`   • Push to remote: ${chalk.green(`gpush -u origin ${branchName}`)}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Checkout failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('pathspec')) {
      console.log(chalk.yellow('💡 Branch does not exist. Use'), chalk.green('gcheckout --list'), chalk.yellow('to see available branches'));
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
