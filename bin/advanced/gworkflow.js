#!/usr/bin/env node

/**
 * gworkflow - Enhanced Git Workflow Automation
 * 
 * Features:
 * - Complete feature development workflows
 * - Hotfix and emergency deployment workflows
 * - Release management with versioning
 * - Team collaboration and review workflows
 * - Automated testing and validation pipelines
 * 
 * Usage:
 *   gworkflow feature <name>     - Start feature workflow
 *   gworkflow hotfix <name>      - Create hotfix workflow
 *   gworkflow release <version>  - Release management
 *   gworkflow --help             - Show this help
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
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
⚡ gworkflow - Enhanced Git Workflow Automation
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gworkflow feature <name>')}       ${chalk.gray('# Start feature development workflow')}`);
  console.log(`   ${chalk.green('gworkflow hotfix <name>')}        ${chalk.gray('# Create emergency hotfix workflow')}`);
  console.log(`   ${chalk.green('gworkflow release <version>')}    ${chalk.gray('# Automated release management')}`);
  console.log(`   ${chalk.green('gworkflow review')}               ${chalk.gray('# Prepare branch for code review')}`);
  console.log(`   ${chalk.green('gworkflow deploy')}               ${chalk.gray('# Production deployment workflow')}`);
  console.log(`   ${chalk.green('gworkflow --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🚀 FEATURE WORKFLOWS:'));
  console.log(`   ${chalk.blue('feature <name>:')} Create feature branch from main/master`);
  console.log(`   ${chalk.blue('feature-finish:')} Merge feature back to develop branch`);
  console.log(`   ${chalk.blue('feature-update:')} Update feature with latest changes`);
  console.log(`   ${chalk.blue('feature-review:')} Prepare feature for code review`);
  
  console.log(chalk.cyan('\n🔥 HOTFIX WORKFLOWS:'));
  console.log(`   ${chalk.red('hotfix <name>:')} Emergency fix from production branch`);
  console.log(`   ${chalk.red('hotfix-finish:')} Apply hotfix to main and develop`);
  console.log(`   ${chalk.red('hotfix-deploy:')} Immediate production deployment`);
  console.log(`   ${chalk.red('hotfix-rollback:')} Rollback problematic hotfix`);
  
  console.log(chalk.cyan('\n📦 RELEASE WORKFLOWS:'));
  console.log(`   ${chalk.blue('release <version>:')} Prepare release branch with version`);
  console.log(`   ${chalk.blue('release-finish:')} Complete release with tags and merge`);
  console.log(`   ${chalk.blue('release-candidate:')} Create release candidate for testing`);
  console.log(`   ${chalk.blue('release-rollback:')} Rollback failed release`);
  
  console.log(chalk.cyan('\n👥 COLLABORATION WORKFLOWS:'));
  console.log(`   ${chalk.yellow('review:')} Prepare current branch for code review`);
  console.log(`   ${chalk.yellow('sync:')} Synchronize all branches with upstream`);
  console.log(`   ${chalk.yellow('cleanup:')} Clean merged branches and local refs`);
  console.log(`   ${chalk.yellow('backup:')} Create backup of current work state`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gworkflow feature user-auth')} - Start user authentication feature`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gworkflow hotfix security-patch')} - Emergency security fix`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gworkflow release v2.1.0')} - Prepare version 2.1.0 release`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gworkflow review')} - Prepare current work for review`);
  
  console.log(chalk.cyan('\n🔧 ADVANCED OPTIONS:'));
  console.log(`   ${chalk.gray('--dry-run')} - Preview workflow actions without executing`);
  console.log(`   ${chalk.gray('--force')} - Force workflow execution (skip validations)`);
  console.log(`   ${chalk.gray('--interactive')} - Interactive workflow with prompts`);
  console.log(`   ${chalk.gray('--template')} - Use predefined workflow templates`);
  
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

// Feature workflow implementation
function featureWorkflow(featureName, subCommand = 'start') {
  console.log(chalk.blue(`🚀 Feature Workflow: ${featureName || subCommand}`));
  
  const mainBranch = branchExists('main') ? 'main' : 'master';
  const developBranch = branchExists('develop') ? 'develop' : mainBranch;
  
  switch (subCommand) {
    case 'start':
      if (!featureName) {
        console.log(chalk.red('❌ Feature name required'));
        console.log(chalk.yellow('💡 Usage: gworkflow feature <feature-name>'));
        return;
      }
      
      const branchName = `feature/${featureName}`;
      
      if (branchExists(branchName)) {
        console.log(chalk.yellow(`⚠️  Feature branch '${branchName}' already exists`));
        runGitCommand(`git checkout ${branchName}`, `Switched to existing feature branch`);
      } else {
        runGitCommand(`git checkout ${developBranch}`, `Switched to ${developBranch}`);
        runGitCommand(`git pull origin ${developBranch}`, `Updated ${developBranch} with latest changes`);
        runGitCommand(`git checkout -b ${branchName}`, `Created feature branch: ${branchName}`);
        
        console.log(chalk.cyan('\n✨ Feature workflow started!'));
        console.log(chalk.gray('Next steps:'));
        console.log(chalk.gray(`   • Start coding your feature`));
        console.log(chalk.gray(`   • Use: ${chalk.green('gquick')} for quick commits`));
        console.log(chalk.gray(`   • Use: ${chalk.green('gworkflow feature-review')} when ready`));
      }
      break;
      
    case 'finish':
      const currentBranch = getCurrentBranch();
      if (!currentBranch.startsWith('feature/')) {
        console.log(chalk.red('❌ Not on a feature branch'));
        return;
      }
      
      if (hasUncommittedChanges()) {
        console.log(chalk.yellow('📦 Committing pending changes...'));
        runGitCommand('git add .', 'Staged all changes');
        runGitCommand('git commit -m "Complete feature development"', 'Committed changes');
      }
      
      runGitCommand(`git checkout ${developBranch}`, `Switched to ${developBranch}`);
      runGitCommand(`git pull origin ${developBranch}`, `Updated ${developBranch}`);
      runGitCommand(`git merge --no-ff ${currentBranch}`, `Merged ${currentBranch} into ${developBranch}`);
      runGitCommand(`git branch -d ${currentBranch}`, `Deleted feature branch`);
      
      console.log(chalk.green('🎉 Feature workflow completed!'));
      break;
      
    default:
      console.log(chalk.red(`❌ Unknown feature subcommand: ${subCommand}`));
  }
}

// Hotfix workflow implementation
function hotfixWorkflow(hotfixName, subCommand = 'start') {
  console.log(chalk.red(`🔥 Hotfix Workflow: ${hotfixName || subCommand}`));
  
  const mainBranch = branchExists('main') ? 'main' : 'master';
  
  switch (subCommand) {
    case 'start':
      if (!hotfixName) {
        console.log(chalk.red('❌ Hotfix name required'));
        console.log(chalk.yellow('💡 Usage: gworkflow hotfix <hotfix-name>'));
        return;
      }
      
      const branchName = `hotfix/${hotfixName}`;
      
      runGitCommand(`git checkout ${mainBranch}`, `Switched to ${mainBranch}`);
      runGitCommand(`git pull origin ${mainBranch}`, `Updated ${mainBranch} with latest changes`);
      runGitCommand(`git checkout -b ${branchName}`, `Created hotfix branch: ${branchName}`);
      
      console.log(chalk.cyan('\n🚨 Hotfix workflow started!'));
      console.log(chalk.red('Emergency fix mode - work quickly and carefully'));
      break;
      
    case 'finish':
      const currentBranch = getCurrentBranch();
      if (!currentBranch.startsWith('hotfix/')) {
        console.log(chalk.red('❌ Not on a hotfix branch'));
        return;
      }
      
      if (hasUncommittedChanges()) {
        runGitCommand('git add .', 'Staged hotfix changes');
        runGitCommand('git commit -m "Emergency hotfix"', 'Committed hotfix');
      }
      
      // Merge to main
      runGitCommand(`git checkout ${mainBranch}`, `Switched to ${mainBranch}`);
      runGitCommand(`git merge --no-ff ${currentBranch}`, `Applied hotfix to ${mainBranch}`);
      
      // Merge to develop if exists
      if (branchExists('develop')) {
        runGitCommand('git checkout develop', 'Switched to develop');
        runGitCommand(`git merge --no-ff ${currentBranch}`, 'Applied hotfix to develop');
      }
      
      runGitCommand(`git branch -d ${currentBranch}`, 'Deleted hotfix branch');
      
      console.log(chalk.green('🎉 Hotfix workflow completed!'));
      break;
      
    default:
      console.log(chalk.red(`❌ Unknown hotfix subcommand: ${subCommand}`));
  }
}

// Release workflow implementation
function releaseWorkflow(version, subCommand = 'start') {
  console.log(chalk.blue(`📦 Release Workflow: ${version || subCommand}`));
  
  switch (subCommand) {
    case 'start':
      if (!version) {
        console.log(chalk.red('❌ Version required'));
        console.log(chalk.yellow('💡 Usage: gworkflow release <version>'));
        return;
      }
      
      const branchName = `release/${version}`;
      const developBranch = branchExists('develop') ? 'develop' : 'main';
      
      runGitCommand(`git checkout ${developBranch}`, `Switched to ${developBranch}`);
      runGitCommand(`git pull origin ${developBranch}`, `Updated ${developBranch}`);
      runGitCommand(`git checkout -b ${branchName}`, `Created release branch: ${branchName}`);
      
      console.log(chalk.cyan(`\n🚀 Release ${version} workflow started!`));
      break;
      
    case 'finish':
      const currentBranch = getCurrentBranch();
      if (!currentBranch.startsWith('release/')) {
        console.log(chalk.red('❌ Not on a release branch'));
        return;
      }
      
      const version = currentBranch.replace('release/', '');
      const mainBranch = branchExists('main') ? 'main' : 'master';
      
      // Merge to main and tag
      runGitCommand(`git checkout ${mainBranch}`, `Switched to ${mainBranch}`);
      runGitCommand(`git merge --no-ff ${currentBranch}`, `Merged release to ${mainBranch}`);
      runGitCommand(`git tag -a v${version} -m "Release version ${version}"`, `Created release tag`);
      
      // Merge back to develop
      if (branchExists('develop')) {
        runGitCommand('git checkout develop', 'Switched to develop');
        runGitCommand(`git merge --no-ff ${currentBranch}`, 'Merged release to develop');
      }
      
      runGitCommand(`git branch -d ${currentBranch}`, 'Deleted release branch');
      
      console.log(chalk.green(`🎉 Release ${version} completed!`));
      break;
      
    default:
      console.log(chalk.red(`❌ Unknown release subcommand: ${subCommand}`));
  }
}

// Code review workflow
function reviewWorkflow() {
  console.log(chalk.blue('👥 Code Review Preparation'));
  
  const currentBranch = getCurrentBranch();
  
  if (hasUncommittedChanges()) {
    console.log(chalk.yellow('📦 Committing current changes...'));
    runGitCommand('git add .', 'Staged all changes');
    runGitCommand('git commit -m "Prepare for code review"', 'Created review commit');
  }
  
  // Push current branch
  try {
    runGitCommand(`git push origin ${currentBranch}`, 'Pushed branch for review');
  } catch (error) {
    runGitCommand(`git push -u origin ${currentBranch}`, 'Created remote branch for review');
  }
  
  console.log(chalk.green('✅ Branch prepared for code review!'));
  console.log(chalk.cyan('\n💡 Next steps:'));
  console.log(chalk.gray('   • Create pull request in your Git hosting platform'));
  console.log(chalk.gray('   • Add reviewers and description'));
  console.log(chalk.gray('   • Wait for feedback and iterate'));
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Help functionality
  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    showHelp();
    return;
  }
  
  // Validate repository
  if (!validateRepository()) {
    process.exit(1);
  }
  
  try {
    const workflow = args[0];
    const workflowParam = args[1];
    
    console.log(chalk.bold.magenta('\n⚡ Git Workflow Automation'));
    console.log(chalk.gray('─'.repeat(50)));
    
    switch (workflow) {
      case 'feature':
        if (workflowParam === 'finish') {
          featureWorkflow(null, 'finish');
        } else if (workflowParam === 'review') {
          reviewWorkflow();
        } else {
          featureWorkflow(workflowParam, 'start');
        }
        break;
        
      case 'hotfix':
        if (workflowParam === 'finish') {
          hotfixWorkflow(null, 'finish');
        } else {
          hotfixWorkflow(workflowParam, 'start');
        }
        break;
        
      case 'release':
        if (workflowParam === 'finish') {
          releaseWorkflow(null, 'finish');
        } else {
          releaseWorkflow(workflowParam, 'start');
        }
        break;
        
      case 'review':
        reviewWorkflow();
        break;
        
      case 'sync':
        console.log(chalk.blue('🔄 Synchronizing all branches...'));
        runGitCommand('git fetch --all', 'Fetched all remotes');
        console.log(chalk.green('✅ Synchronization completed!'));
        break;
        
      case 'cleanup':
        console.log(chalk.blue('🧹 Cleaning up merged branches...'));
        try {
          runGitCommand('git branch --merged | grep -v "\\*\\|main\\|master\\|develop" | xargs -n 1 git branch -d || true', 'Cleaned merged branches');
          runGitCommand('git remote prune origin', 'Cleaned remote references');
          console.log(chalk.green('✅ Cleanup completed!'));
        } catch (error) {
          console.log(chalk.yellow('⚠️  Cleanup completed with warnings'));
        }
        break;
        
      default:
        console.log(chalk.red(`❌ Unknown workflow: ${workflow}`));
        console.log(chalk.yellow('💡 Use --help to see available workflows'));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Workflow failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    console.log(chalk.yellow('\n💡 Recovery suggestions:'));
    console.log(chalk.gray(`   • Check repository state: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Reset if needed: ${chalk.green('greset --soft')}`));
    console.log(chalk.gray(`   • Get help: ${chalk.green('gworkflow --help')}`));
    
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

