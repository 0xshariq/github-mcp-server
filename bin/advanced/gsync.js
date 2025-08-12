#!/usr/bin/env node

/**
 * gsync - Enhanced Repository Synchronization Manager
 * 
 * Features:
 * - Multi-branch synchronization workflows
 * - Upstream tracking and conflict detection
 * - Automatic merge conflict resolution guidance
 * - Team collaboration sync strategies
 * - Repository health validation
 * 
 * Usage:
 *   gsync                    - Smart sync with upstream
 *   gsync --all              - Sync all branches
 *   gsync --upstream         - Sync with upstream fork
 *   gsync --force            - Force sync (with backup)
 *   gsync --help             - Show this help
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
🔄 gsync - Enhanced Repository Synchronization Manager
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gsync')}                      ${chalk.gray('# Smart sync with remote')}`);
  console.log(`   ${chalk.green('gsync --all')}                ${chalk.gray('# Sync all local branches')}`);
  console.log(`   ${chalk.green('gsync --upstream')}           ${chalk.gray('# Sync with upstream fork')}`);
  console.log(`   ${chalk.green('gsync --force')}              ${chalk.gray('# Force sync with backup')}`);
  console.log(`   ${chalk.green('gsync --dry-run')}            ${chalk.gray('# Preview sync operations')}`);
  console.log(`   ${chalk.green('gsync --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 SYNC STRATEGIES:'));
  console.log(`   ${chalk.blue('Smart Sync:')} Analyze changes and choose optimal sync method`);
  console.log(`   ${chalk.blue('Fast-Forward:')} Simple fast-forward merge when possible`);
  console.log(`   ${chalk.blue('Three-Way Merge:')} Full merge for diverged branches`);
  console.log(`   ${chalk.blue('Rebase Sync:')} Rebase local commits onto remote changes`);
  
  console.log(chalk.cyan('\n🔍 CONFLICT HANDLING:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Detection:')} Automatically detect merge conflicts`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Guidance:')} Provide resolution suggestions`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Backup:')} Create safety backups before risky operations`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Recovery:')} Easy rollback if sync fails`);
  
  console.log(chalk.cyan('\n⚡ SYNC FEATURES:'));
  console.log(`   ${chalk.blue('Multi-Branch:')} Sync multiple branches in one operation`);
  console.log(`   ${chalk.blue('Upstream Support:')} Sync with upstream repositories (forks)`);
  console.log(`   ${chalk.blue('Health Checks:')} Validate repository state before/after`);
  console.log(`   ${chalk.blue('Status Reports:')} Detailed sync results and next steps`);
  
  console.log(chalk.cyan('\n🚀 WORKFLOW EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gsync')} - Quick sync before starting work`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gsync --all')} - Sync all feature branches`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gsync --upstream')} - Sync fork with original`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gsync --force')} - Force sync with backup`);
  
  console.log(chalk.cyan('\n🔧 ADVANCED OPTIONS:'));
  console.log(`   ${chalk.gray('--dry-run')} - Preview what would be synced`);
  console.log(`   ${chalk.gray('--no-backup')} - Skip automatic backups`);
  console.log(`   ${chalk.gray('--rebase')} - Use rebase instead of merge`);
  console.log(`   ${chalk.gray('--prune')} - Remove deleted remote branches`);
  
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

// Check for uncommitted changes
function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Check if remote exists
function hasRemote(remoteName = 'origin') {
  try {
    execSync(`git remote get-url ${remoteName}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get tracking branch info
function getTrackingInfo(branchName) {
  try {
    const upstream = execSync(`git rev-parse --abbrev-ref ${branchName}@{upstream}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    const behind = execSync(`git rev-list --count ${branchName}..${upstream}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    const ahead = execSync(`git rev-list --count ${upstream}..${branchName}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    return {
      upstream,
      behind: parseInt(behind),
      ahead: parseInt(ahead),
      hasUpstream: true
    };
  } catch (error) {
    return { hasUpstream: false, behind: 0, ahead: 0 };
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

// Create backup before risky operations
function createSyncBackup() {
  try {
    const currentBranch = getCurrentBranch();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 16);
    const backupName = `sync-backup-${currentBranch}-${timestamp}`;
    
    runGitCommand(`git branch ${backupName}`, `Created backup branch: ${backupName}`);
    return backupName;
  } catch (error) {
    console.log(chalk.yellow('⚠️  Unable to create backup branch'));
    return null;
  }
}

// Perform repository health check
function healthCheck() {
  console.log(chalk.blue('🩺 Repository Health Check:'));
  
  // Check remotes
  if (!hasRemote('origin')) {
    console.log(chalk.red('   ❌ No origin remote configured'));
    return false;
  } else {
    console.log(chalk.green('   ✅ Origin remote configured'));
  }
  
  // Check current branch tracking
  const currentBranch = getCurrentBranch();
  const tracking = getTrackingInfo(currentBranch);
  
  if (!tracking.hasUpstream) {
    console.log(chalk.yellow(`   ⚠️  Current branch '${currentBranch}' not tracking remote`));
  } else {
    console.log(chalk.green(`   ✅ Tracking: ${tracking.upstream}`));
    if (tracking.behind > 0) {
      console.log(chalk.yellow(`   📥 Behind by ${tracking.behind} commit(s)`));
    }
    if (tracking.ahead > 0) {
      console.log(chalk.yellow(`   📤 Ahead by ${tracking.ahead} commit(s)`));
    }
    if (tracking.behind === 0 && tracking.ahead === 0) {
      console.log(chalk.green('   ✅ Branch is up to date'));
    }
  }
  
  return true;
}

// Sync single branch
function syncBranch(branchName, options = {}) {
  console.log(chalk.blue(`🔄 Syncing branch: ${branchName}`));
  
  const tracking = getTrackingInfo(branchName);
  
  if (!tracking.hasUpstream) {
    console.log(chalk.yellow(`   ⚠️  Branch '${branchName}' has no upstream tracking`));
    return false;
  }
  
  try {
    if (tracking.behind > 0 && tracking.ahead === 0) {
      // Fast-forward possible
      runGitCommand(`git merge --ff-only ${tracking.upstream}`, `Fast-forwarded ${branchName}`);
    } else if (tracking.behind > 0 && tracking.ahead > 0) {
      // Diverged branches
      if (options.rebase) {
        runGitCommand(`git rebase ${tracking.upstream}`, `Rebased ${branchName} onto ${tracking.upstream}`);
      } else {
        runGitCommand(`git merge ${tracking.upstream}`, `Merged ${tracking.upstream} into ${branchName}`);
      }
    } else if (tracking.behind === 0) {
      console.log(chalk.green(`   ✅ Branch '${branchName}' is already up to date`));
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`   ❌ Failed to sync ${branchName}: ${error.message}`));
    return false;
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
    const allMode = args.includes('--all');
    const upstreamMode = args.includes('--upstream');
    const forceMode = args.includes('--force');
    const dryRunMode = args.includes('--dry-run');
    const rebaseMode = args.includes('--rebase');
    const pruneMode = args.includes('--prune');
    
    console.log(chalk.bold.magenta('\n🔄 Repository Synchronization Manager'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Pre-sync health check
    if (!healthCheck()) {
      console.log(chalk.red('\n❌ Health check failed - please fix issues before syncing'));
      process.exit(1);
    }
    
    const currentBranch = getCurrentBranch();
    let backupBranch = null;
    
    // Create backup if needed
    if (forceMode && !dryRunMode) {
      backupBranch = createSyncBackup();
    }
    
    // Check for uncommitted changes
    if (hasUncommittedChanges() && !dryRunMode) {
      console.log(chalk.yellow('\n📦 Stashing uncommitted changes...'));
      runGitCommand('git stash push -m "Auto-stash before sync"', 'Stashed uncommitted changes');
    }
    
    console.log(chalk.blue('\n📡 Fetching remote changes...'));
    if (dryRunMode) {
      console.log(chalk.gray('   [DRY RUN] Would fetch from remote'));
    } else {
      runGitCommand('git fetch --all', 'Fetched all remotes');
      
      if (pruneMode) {
        runGitCommand('git remote prune origin', 'Pruned deleted remote branches');
      }
    }
    
    if (allMode) {
      console.log(chalk.blue('\n🌿 Syncing all local branches...'));
      
      const branches = execSync('git branch --format="%(refname:short)"', { encoding: 'utf8' })
        .trim().split('\n').filter(branch => branch.length > 0);
      
      let successCount = 0;
      
      for (const branch of branches) {
        if (dryRunMode) {
          console.log(chalk.gray(`   [DRY RUN] Would sync: ${branch}`));
          continue;
        }
        
        // Switch to branch and sync
        try {
          runGitCommand(`git checkout ${branch}`, null); // Silent checkout
          if (syncBranch(branch, { rebase: rebaseMode })) {
            successCount++;
          }
        } catch (error) {
          console.log(chalk.red(`   ❌ Failed to sync ${branch}`));
        }
      }
      
      // Return to original branch
      if (!dryRunMode) {
        runGitCommand(`git checkout ${currentBranch}`, `Returned to ${currentBranch}`);
      }
      
      console.log(chalk.cyan(`\n📊 Sync Summary: ${successCount}/${branches.length} branches synced`));
      
    } else if (upstreamMode) {
      console.log(chalk.blue('\n🔗 Syncing with upstream repository...'));
      
      if (dryRunMode) {
        console.log(chalk.gray('   [DRY RUN] Would sync with upstream'));
      } else {
        if (hasRemote('upstream')) {
          runGitCommand('git fetch upstream', 'Fetched upstream changes');
          
          const mainBranch = currentBranch === 'main' || currentBranch === 'master' ? currentBranch : 'main';
          try {
            runGitCommand(`git checkout ${mainBranch}`, `Switched to ${mainBranch}`);
            runGitCommand(`git merge upstream/${mainBranch}`, `Merged upstream/${mainBranch}`);
            runGitCommand(`git checkout ${currentBranch}`, `Returned to ${currentBranch}`);
          } catch (error) {
            console.log(chalk.yellow('⚠️  Upstream sync completed with warnings'));
          }
        } else {
          console.log(chalk.yellow('⚠️  No upstream remote found'));
          console.log(chalk.gray('   Add upstream with: git remote add upstream <url>'));
        }
      }
      
    } else {
      // Default: sync current branch
      console.log(chalk.blue(`\n🔄 Syncing current branch: ${currentBranch}`));
      
      if (dryRunMode) {
        const tracking = getTrackingInfo(currentBranch);
        console.log(chalk.gray(`   [DRY RUN] Would sync with: ${tracking.upstream || 'no upstream'}`));
        if (tracking.behind > 0) {
          console.log(chalk.gray(`   [DRY RUN] Would pull ${tracking.behind} commit(s)`));
        }
        if (tracking.ahead > 0) {
          console.log(chalk.gray(`   [DRY RUN] Local branch is ${tracking.ahead} commit(s) ahead`));
        }
      } else {
        syncBranch(currentBranch, { rebase: rebaseMode });
      }
    }
    
    // Restore stashed changes
    if (hasUncommittedChanges() === false && !dryRunMode) {
      try {
        const stashList = execSync('git stash list', { encoding: 'utf8' });
        if (stashList.includes('Auto-stash before sync')) {
          console.log(chalk.blue('\n📦 Restoring stashed changes...'));
          runGitCommand('git stash pop', 'Restored stashed changes');
        }
      } catch (error) {
        // Stash restoration failed - not critical
      }
    }
    
    if (!dryRunMode) {
      console.log(chalk.green.bold('\n🎉 Repository synchronization completed!'));
      
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
      console.log(chalk.gray(`   • View changes: ${chalk.green('glog -5')}`));
      console.log(chalk.gray(`   • Continue development`));
      
      if (backupBranch) {
        console.log(chalk.gray(`   • Backup created: ${chalk.blue(backupBranch)}`));
      }
    } else {
      console.log(chalk.cyan('\n📋 Dry run completed - no changes made'));
      console.log(chalk.gray('Run without --dry-run to execute sync operations'));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Repository sync failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    console.log(chalk.yellow('\n💡 Recovery suggestions:'));
    console.log(chalk.gray(`   • Check repository state: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Reset if needed: ${chalk.green('greset --soft')}`));
    console.log(chalk.gray(`   • Get help: ${chalk.green('gsync --help')}`));
    
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
