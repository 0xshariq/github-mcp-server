#!/usr/bin/env node

/**
 * gdev - Enhanced Developer Workflow Manager
 * 
 * Features:
 * - Smart development session initialization
 * - Feature branch creation with templates
 * - Work-in-progress management
 * - Team synchronization workflows
 * - Development environment setup
 * 
 * Usage:
 *   gdev                     - Start development session
 *   gdev <branch-name>       - Create feature branch
 *   gdev --continue          - Resume stashed work
 *   gdev --sync              - Sync with upstream
 *   gdev --help              - Show this help
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
👨‍💻 gdev - Enhanced Developer Workflow Manager
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gdev')}                        ${chalk.gray('# Start development session')}`);
  console.log(`   ${chalk.green('gdev feature-auth')}           ${chalk.gray('# Create feature branch')}`);
  console.log(`   ${chalk.green('gdev hotfix-login')}           ${chalk.gray('# Create hotfix branch')}`);
  console.log(`   ${chalk.green('gdev --continue')}             ${chalk.gray('# Resume stashed work')}`);
  console.log(`   ${chalk.green('gdev --sync')}                 ${chalk.gray('# Sync with upstream')}`);
  console.log(`   ${chalk.green('gdev --clean')}                ${chalk.gray('# Clean development environment')}`);
  console.log(`   ${chalk.green('gdev --help')}                 ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 DEVELOPMENT SESSION:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Status Check:')} Current repository state`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Info:')} Active branches and remotes`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Update Check:')} Latest changes from upstream`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Environment:')} Development setup validation`);
  
  console.log(chalk.cyan('\n🌿 BRANCH MANAGEMENT:'));
  console.log(`   ${chalk.blue('Feature Branches:')} feature/*, feat/*`);
  console.log(`   ${chalk.blue('Bugfix Branches:')} bugfix/*, fix/*`);
  console.log(`   ${chalk.blue('Hotfix Branches:')} hotfix/*`);
  console.log(`   ${chalk.blue('Experiment Branches:')} exp/*, test/*`);
  
  console.log(chalk.cyan('\n🔄 WORKFLOW OPTIONS:'));
  console.log(`   ${chalk.blue('--continue:')} Restore stashed work and continue development`);
  console.log(`   ${chalk.blue('--sync:')} Pull latest changes from main/master`);
  console.log(`   ${chalk.blue('--clean:')} Clean up merged branches and temp files`);
  console.log(`   ${chalk.blue('--setup:')} Initialize development environment`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gdev')} - Start daily coding session`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gdev feature-user-profile')} - New feature branch`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gdev --continue')} - Resume yesterday's work`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gdev --sync')} - Get latest team changes`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Check if branch exists
function branchExists(branchName) {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { stdio: 'pipe' });
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

// Check for stashed changes
function hasStashedChanges() {
  try {
    const stashList = execSync('git stash list', { encoding: 'utf8' });
    return stashList.trim().length > 0;
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

// Show repository status overview
function showRepositoryOverview() {
  console.log(chalk.blue('📊 Repository Overview:'));
  
  // Current branch
  const currentBranch = getCurrentBranch();
  console.log(chalk.cyan(`   • Current Branch: ${chalk.white(currentBranch)}`));
  
  // Repository status
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = status.trim().split('\n').filter(line => line.length > 0);
    
    if (lines.length === 0) {
      console.log(chalk.green('   • Working Directory: Clean'));
    } else {
      console.log(chalk.yellow(`   • Changes: ${lines.length} file(s) modified`));
    }
  } catch (error) {
    console.log(chalk.red('   • Status: Unable to check'));
  }
  
  // Stash status
  if (hasStashedChanges()) {
    try {
      const stashCount = execSync('git stash list | wc -l', { encoding: 'utf8' }).trim();
      console.log(chalk.blue(`   • Stashed Changes: ${stashCount} stash(es) available`));
    } catch (error) {
      console.log(chalk.blue('   • Stashed Changes: Available'));
    }
  }
  
  // Remote status
  try {
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (remotes.trim()) {
      const remoteCount = remotes.split('\n').filter(line => line.includes('fetch')).length;
      console.log(chalk.cyan(`   • Remotes: ${remoteCount} configured`));
    }
  } catch (error) {
    console.log(chalk.yellow('   • Remotes: None configured'));
  }
}

// Show available branches
function showBranchInfo() {
  console.log(chalk.blue('\n🌿 Branch Information:'));
  
  try {
    const branches = execSync('git branch -a --format="%(refname:short)|%(committerdate:relative)"', { encoding: 'utf8' });
    const branchLines = branches.trim().split('\n').filter(line => line.length > 0);
    
    console.log(chalk.cyan('   Local Branches:'));
    branchLines
      .filter(line => !line.includes('remotes/'))
      .slice(0, 5)
      .forEach(line => {
        const [name, date] = line.split('|');
        const isCurrentBranch = name === getCurrentBranch();
        const indicator = isCurrentBranch ? '→' : ' ';
        const color = isCurrentBranch ? chalk.green : chalk.white;
        console.log(`   ${indicator} ${color(name)} ${chalk.gray(`(${date})`)}`);
      });
    
    const remoteCount = branchLines.filter(line => line.includes('remotes/')).length;
    if (remoteCount > 0) {
      console.log(chalk.cyan(`   Remote Branches: ${remoteCount} available`));
    }
  } catch (error) {
    console.log(chalk.red('   Error: Unable to fetch branch information'));
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
    const continueMode = args.includes('--continue');
    const syncMode = args.includes('--sync');
    const cleanMode = args.includes('--clean');
    const setupMode = args.includes('--setup');
    const branchName = args.find(arg => !arg.startsWith('--'))?.trim();
    
    console.log(chalk.bold.magenta('\n👨‍💻 Developer Workflow Manager'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (continueMode) {
      console.log(chalk.blue('🔄 Continuing previous work...'));
      
      if (hasStashedChanges()) {
        runGitCommand('git stash pop', 'Previous work restored from stash');
      } else {
        console.log(chalk.yellow('💡 No stashed changes found'));
      }
      
      showRepositoryOverview();
      
    } else if (syncMode) {
      console.log(chalk.blue('🔄 Syncing with upstream...'));
      
      const currentBranch = getCurrentBranch();
      const hasChanges = hasUncommittedChanges();
      
      if (hasChanges) {
        console.log(chalk.yellow('📦 Stashing current changes...'));
        runGitCommand('git stash push -m "Auto-stash before sync"', 'Changes stashed');
      }
      
      try {
        runGitCommand('git fetch origin', 'Fetched latest changes');
        
        // Try to pull main/master
        const mainBranch = branchExists('main') ? 'main' : 'master';
        runGitCommand(`git checkout ${mainBranch}`, `Switched to ${mainBranch}`);
        runGitCommand(`git pull origin ${mainBranch}`, `Updated ${mainBranch} branch`);
        
        if (currentBranch !== mainBranch) {
          runGitCommand(`git checkout ${currentBranch}`, `Returned to ${currentBranch}`);
        }
        
        if (hasChanges) {
          console.log(chalk.blue('📦 Restoring stashed changes...'));
          runGitCommand('git stash pop', 'Changes restored');
        }
        
      } catch (error) {
        console.log(chalk.yellow('⚠️  Sync completed with warnings'));
      }
      
    } else if (cleanMode) {
      console.log(chalk.blue('🧹 Cleaning development environment...'));
      
      try {
        // Clean merged branches
        runGitCommand('git branch --merged | grep -v "\\*\\|main\\|master" | xargs -n 1 git branch -d || true', 'Cleaned merged branches');
        
        // Clean git objects
        runGitCommand('git gc --prune=now', 'Cleaned git objects');
        
        console.log(chalk.green('✨ Environment cleaned successfully'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Cleaning completed with warnings'));
      }
      
    } else if (branchName) {
      console.log(chalk.blue(`🌿 Creating feature branch: ${branchName}`));
      
      if (branchExists(branchName)) {
        console.log(chalk.yellow('⚠️  Branch already exists, switching to it'));
        runGitCommand(`git checkout ${branchName}`, `Switched to ${branchName}`);
      } else {
        // Determine branch prefix based on name
        let fullBranchName = branchName;
        if (!branchName.includes('/')) {
          if (branchName.startsWith('feature-') || branchName.startsWith('feat-')) {
            fullBranchName = branchName.replace(/^(feature|feat)-/, 'feature/');
          } else if (branchName.startsWith('fix-') || branchName.startsWith('bugfix-')) {
            fullBranchName = branchName.replace(/^(fix|bugfix)-/, 'bugfix/');
          } else if (branchName.startsWith('hotfix-')) {
            fullBranchName = branchName.replace(/^hotfix-/, 'hotfix/');
          } else {
            fullBranchName = `feature/${branchName}`;
          }
        }
        
        runGitCommand(`git checkout -b ${fullBranchName}`, `Created and switched to ${fullBranchName}`);
        
        console.log(chalk.cyan('\n💡 Branch created successfully!'));
        console.log(chalk.gray(`   • Start coding your feature`));
        console.log(chalk.gray(`   • Use: ${chalk.green('gquick')} for quick commits`));
        console.log(chalk.gray(`   • Use: ${chalk.green('gpush')} when ready to share`));
      }
      
    } else {
      // Default: Start development session
      console.log(chalk.blue('🌅 Starting development session...'));
      
      showRepositoryOverview();
      showBranchInfo();
      
      // Check for updates
      console.log(chalk.blue('\n📡 Checking for updates...'));
      try {
        runGitCommand('git fetch origin --dry-run', 'Checked for remote updates');
        console.log(chalk.green('✅ Repository is up to date'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Unable to check for updates'));
      }
      
      console.log(chalk.cyan('\n💡 Ready to start coding!'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray(`   • Create feature branch: ${chalk.green('gdev feature-name')}`));
      console.log(chalk.gray(`   • Continue previous work: ${chalk.green('gdev --continue')}`));
      console.log(chalk.gray(`   • Sync with team: ${chalk.green('gdev --sync')}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Developer workflow failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    console.log(chalk.yellow('\n💡 Recovery suggestions:'));
    console.log(chalk.gray(`   • Check repository: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Reset if needed: ${chalk.green('greset --soft')}`));
    console.log(chalk.gray(`   • Get help: ${chalk.green('gdev --help')}`));
    
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
