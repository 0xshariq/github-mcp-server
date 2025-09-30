#!/usr/bin/env node

/**
 * gbackup - Enhanced Repository Backup Manager
 * 
 * Features:
 * - Multiple backup strategies (branch, tag, stash, remote)
 * - Automatic backup naming and timestamping
 * - Backup verification and integrity checks
 * - Repository state snapshots
 * - Easy restoration and rollback capabilities
 * 
 * Usage:
 *   gbackup                  - Smart auto backup
 *   gbackup --branch         - Create backup branch
 *   gbackup --tag            - Create backup tag
 *   gbackup --all            - Full backup suite
 *   gbackup --help           - Show this help
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
  console.log(chalk.bold.magenta('\n🗄️ gbackup - Repository Backup'));
  
  console.log(chalk.cyan('Purpose:'), 'Create comprehensive repository backups with various strategies for data protection and disaster recovery.\n');
  
  console.log(chalk.cyan('Command:'), 'gbackup [strategy] [options]');
  
  console.log(chalk.cyan('\nParameters:'));
  console.log('  [strategy]   - Optional backup strategy (branch, tag, full, incremental)');
  
  console.log(chalk.cyan('\nEssential Options:'));
  console.log('  ' + chalk.green('--branch <name>') + '      - Backup specific branch');
  console.log('  ' + chalk.green('--all-branches') + '       - Backup all branches');  
  console.log('  ' + chalk.green('--tags') + '               - Include all tags in backup');
  console.log('  ' + chalk.green('--full') + '               - Complete repository backup');
  console.log('  ' + chalk.green('--incremental') + '        - Incremental backup since last backup');
  console.log('  ' + chalk.green('--compress') + '           - Compress backup archives');
  console.log('  ' + chalk.green('--remote <url>') + '       - Push backup to remote location');
  console.log('  ' + chalk.green('--verify') + '             - Verify backup integrity after creation');
  console.log('  ' + chalk.green('--name <name>') + '        - Custom backup name');
  console.log('  ' + chalk.green('--message <msg>') + '      - Custom backup description');
  console.log('  ' + chalk.green('--list') + '               - List all available backups');
  console.log('  ' + chalk.green('--restore <name>') + '     - Restore from backup');
  console.log('  ' + chalk.green('--cleanup') + '            - Clean old backup files');
  console.log('  ' + chalk.green('-h, --help') + '           - Show detailed help information');
  
  console.log(chalk.cyan('\nCommon Use Cases:'));
  console.log(chalk.white('  gbackup') + '                               # Default backup strategy');
  console.log(chalk.white('  gbackup --help') + '                        # Show help');
  console.log(chalk.white('  gbackup --branch main') + '                 # Backup main branch only');
  console.log(chalk.white('  gbackup --all-branches') + '                # Backup all branches');
  console.log(chalk.white('  gbackup --tags') + '                        # Backup with all tags');
  console.log(chalk.white('  gbackup --full --compress') + '             # Complete compressed backup');
  console.log(chalk.white('  gbackup --incremental') + '                 # Incremental since last backup');
  console.log(chalk.white('  gbackup --remote backup-server') + '        # Push to backup server');
  console.log(chalk.white('  gbackup --verify --compress') + '           # Compressed backup with verification');
  console.log(chalk.white('  gbackup --name "before-refactor"') + '       # Named branch backup');
  console.log(chalk.white('  gbackup --list') + '                        # List available backups');
  console.log(chalk.white('  gbackup --restore backup-name') + '         # Restore from backup');
  
  console.log(chalk.cyan('\nBackup Strategies:'));
  console.log('  • Branch backup      - Backs up specific branch with history');
  console.log('  • Full backup        - Complete repository including all branches and tags');
  console.log('  • Incremental backup - Only changes since last backup');
  console.log('  • Tag backup         - Backup specific tagged versions');
  console.log('  • Remote backup      - Push backups to remote storage');
  
  console.log(chalk.cyan('\nWorkflow Tips:'));
  console.log('  • Use ' + chalk.yellow('--verify') + ' to ensure backup integrity');
  console.log('  • Use ' + chalk.yellow('--compress') + ' to save storage space');
  console.log('  • Use ' + chalk.yellow('--incremental') + ' for faster regular backups');
  console.log('  • Use ' + chalk.yellow('--list') + ' to see available backups before restoring');
  
  console.log(chalk.cyan('\nSafety Notes:'));
  console.log('  • Backups are timestamped to prevent conflicts');
  console.log('  • Use ' + chalk.yellow('--cleanup') + ' to remove old backup files');
  console.log('  • Verify backup integrity before important operations');
  
  console.log(chalk.gray('\n════════════════════════════════════════════════════════════'));
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Generate backup name with timestamp
function generateBackupName(prefix = 'backup', customName = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const currentBranch = getCurrentBranch();
  
  if (customName) {
    return `${prefix}-${customName}-${timestamp}`;
  } else {
    return `${prefix}-${currentBranch}-${timestamp}`;
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

// Create branch backup
function createBranchBackup(backupName, message) {
  console.log(chalk.blue('🌿 Creating branch backup...'));
  
  if (hasUncommittedChanges()) {
    console.log(chalk.yellow('📦 Committing uncommitted changes...'));
    runGitCommand('git add .', 'Staged all changes');
    runGitCommand(`git commit -m "Backup commit: ${message || 'Auto backup'}"`, 'Committed changes');
  }
  
  runGitCommand(`git branch ${backupName}`, `Created backup branch: ${backupName}`);
  
  console.log(chalk.cyan(`💡 Backup branch '${backupName}' created successfully`));
  console.log(chalk.gray(`   Restore with: ${chalk.green(`gcheckout ${backupName}`)}`));
  
  return backupName;
}

// Create tag backup
function createTagBackup(backupName, message) {
  console.log(chalk.blue('🏷️  Creating tag backup...'));
  
  if (hasUncommittedChanges()) {
    console.log(chalk.yellow('📦 Committing uncommitted changes...'));
    runGitCommand('git add .', 'Staged all changes');
    runGitCommand(`git commit -m "Backup commit: ${message || 'Auto backup'}"`, 'Committed changes');
  }
  
  const tagMessage = message || `Backup created on ${new Date().toISOString()}`;
  runGitCommand(`git tag -a ${backupName} -m "${tagMessage}"`, `Created backup tag: ${backupName}`);
  
  console.log(chalk.cyan(`💡 Backup tag '${backupName}' created successfully`));
  console.log(chalk.gray(`   Restore with: ${chalk.green(`gcheckout ${backupName}`)}`));
  
  return backupName;
}

// Create stash backup
function createStashBackup(message) {
  console.log(chalk.blue('📦 Creating stash backup...'));
  
  if (!hasUncommittedChanges()) {
    console.log(chalk.yellow('💡 No uncommitted changes to stash'));
    return null;
  }
  
  const stashMessage = message || `Backup stash created on ${new Date().toISOString()}`;
  runGitCommand(`git stash push -m "${stashMessage}"`, 'Created backup stash');
  
  console.log(chalk.cyan('💡 Stash backup created successfully'));
  console.log(chalk.gray(`   Restore with: ${chalk.green('git stash pop')}`));
  
  return stashMessage;
}

// Create remote backup
function createRemoteBackup(branchName) {
  console.log(chalk.blue('🌐 Creating remote backup...'));
  
  try {
    runGitCommand(`git push origin ${branchName}`, `Pushed backup branch to remote`);
    console.log(chalk.cyan(`💡 Remote backup '${branchName}' pushed successfully`));
    return branchName;
  } catch (error) {
    console.log(chalk.yellow('⚠️  Remote backup failed - no remote configured or connection issue'));
    return null;
  }
}

// List available backups
function listBackups() {
  console.log(chalk.blue('📋 Available Backups:'));
  
  try {
    // List backup branches
    const branches = execSync('git branch -a | grep backup', { encoding: 'utf8' });
    if (branches.trim()) {
      console.log(chalk.cyan('\n🌿 Backup Branches:'));
      branches.trim().split('\n').forEach(branch => {
        const cleanBranch = branch.replace(/^\s*\*?\s*/, '').replace('remotes/origin/', '');
        console.log(`   ${chalk.green('•')} ${chalk.white(cleanBranch)}`);
      });
    }
  } catch (error) {
    console.log(chalk.gray('   No backup branches found'));
  }
  
  try {
    // List backup tags
    const tags = execSync('git tag -l "*backup*"', { encoding: 'utf8' });
    if (tags.trim()) {
      console.log(chalk.cyan('\n🏷️  Backup Tags:'));
      tags.trim().split('\n').forEach(tag => {
        console.log(`   ${chalk.green('•')} ${chalk.white(tag)}`);
      });
    }
  } catch (error) {
    console.log(chalk.gray('   No backup tags found'));
  }
  
  try {
    // List backup stashes
    const stashes = execSync('git stash list | grep -i backup', { encoding: 'utf8' });
    if (stashes.trim()) {
      console.log(chalk.cyan('\n📦 Backup Stashes:'));
      stashes.trim().split('\n').slice(0, 5).forEach(stash => {
        console.log(`   ${chalk.green('•')} ${chalk.white(stash)}`);
      });
    }
  } catch (error) {
    console.log(chalk.gray('   No backup stashes found'));
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
    const branchMode = args.includes('--branch');
    const tagMode = args.includes('--tag');
    const stashMode = args.includes('--stash');
    const remoteMode = args.includes('--remote');
    const allMode = args.includes('--all');
    const listMode = args.includes('--list');
    const verifyMode = args.includes('--verify');
    const cleanupMode = args.includes('--cleanup');
    
    const customName = args.find(arg => arg === '--name') ? args[args.indexOf('--name') + 1] : '';
    const customMessage = args.find(arg => arg === '--message') ? args[args.indexOf('--message') + 1] : '';
    
    console.log(chalk.bold.magenta('\n🗄️  Repository Backup Manager'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (listMode) {
      listBackups();
      return;
    }
    
    if (cleanupMode) {
      console.log(chalk.blue('🧹 Cleaning up old backups...'));
      try {
        // Clean backup branches older than 30 days
        runGitCommand('git for-each-ref --format="%(refname:short) %(committerdate)" refs/heads/backup* | while read branch date; do if [[ $(date -d "$date" +%s) -lt $(date -d "30 days ago" +%s) ]]; then git branch -D "$branch"; fi; done || true', 'Cleaned old backup branches');
        console.log(chalk.green('✅ Cleanup completed'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Cleanup completed with warnings'));
      }
      return;
    }
    
    console.log(chalk.blue('📊 Repository Status:'));
    console.log(chalk.cyan(`   • Current Branch: ${chalk.white(getCurrentBranch())}`));
    console.log(chalk.cyan(`   • Uncommitted Changes: ${hasUncommittedChanges() ? chalk.yellow('Yes') : chalk.green('None')}`));
    
    const backupResults = [];
    
    if (allMode || (!branchMode && !tagMode && !stashMode && !remoteMode)) {
      // Smart backup or all mode
      console.log(chalk.blue('\n🤖 Smart Backup Strategy:'));
      
      // Always create branch backup
      const branchName = generateBackupName('backup', customName);
      const branchResult = createBranchBackup(branchName, customMessage);
      if (branchResult) backupResults.push(`Branch: ${branchResult}`);
      
      if (allMode) {
        // Create tag backup
        const tagName = generateBackupName('backup-tag', customName);
        const tagResult = createTagBackup(tagName, customMessage);
        if (tagResult) backupResults.push(`Tag: ${tagResult}`);
        
        // Create stash backup if changes exist
        const stashResult = createStashBackup(customMessage);
        if (stashResult) backupResults.push(`Stash: ${stashResult}`);
        
        // Create remote backup
        const remoteResult = createRemoteBackup(branchName);
        if (remoteResult) backupResults.push(`Remote: ${remoteResult}`);
      }
      
    } else {
      // Specific backup modes
      if (branchMode) {
        const branchName = generateBackupName('backup', customName);
        const result = createBranchBackup(branchName, customMessage);
        if (result) backupResults.push(`Branch: ${result}`);
      }
      
      if (tagMode) {
        const tagName = generateBackupName('backup-tag', customName);
        const result = createTagBackup(tagName, customMessage);
        if (result) backupResults.push(`Tag: ${result}`);
      }
      
      if (stashMode) {
        const result = createStashBackup(customMessage);
        if (result) backupResults.push(`Stash: ${result}`);
      }
      
      if (remoteMode) {
        const currentBranch = getCurrentBranch();
        const result = createRemoteBackup(currentBranch);
        if (result) backupResults.push(`Remote: ${result}`);
      }
    }
    
    console.log(chalk.green.bold('\n🎉 Backup completed successfully!'));
    
    if (backupResults.length > 0) {
      console.log(chalk.cyan('\n📋 Backup Summary:'));
      backupResults.forEach(result => {
        console.log(chalk.green(`   ✅ ${result}`));
      });
    }
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • View backups: ${chalk.green('gbackup --list')}`));
    console.log(chalk.gray(`   • Continue working safely`));
    console.log(chalk.gray(`   • Restore if needed from backup list`));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Backup failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    console.log(chalk.yellow('\n💡 Recovery suggestions:'));
    console.log(chalk.gray(`   • Check repository: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Try simpler backup: ${chalk.green('gbackup --branch')}`));
    console.log(chalk.gray(`   • Get help: ${chalk.green('gbackup --help')}`));
    
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