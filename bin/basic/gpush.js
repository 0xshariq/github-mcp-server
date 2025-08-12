#!/usr/bin/env node

/**
 * gpush - Enhanced Git Push with Safety Checks
 * 
 * Features:
 * - Repository validation and safety checks
 * - Branch tracking and upstream setup
 * - Beautiful progress display with details
 * - Force push safety warnings
 * - Automatic upstream branch setup
 * 
 * Usage:
 *   gpush                   - Push to remote repository
 *   gpush --force           - Force push (use with caution)
 *   gpush --upstream        - Set upstream and push
 *   gpush --help            - Show this help
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

// Execute git command with progress display
function runGitCommand(command, description, showOutput = true) {
  try {
    console.log(chalk.cyan(`🔧 ${description}...`));
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: showOutput ? 'inherit' : 'pipe'
    });
    console.log(chalk.green('✅ Operation completed successfully!'));
    return { success: true, output: result };
  } catch (error) {
    console.log(chalk.red(`❌ Failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

// Get repository information
function getRepositoryInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const remote = execSync(`git config --get branch.${branch}.remote`, { encoding: 'utf8', stdio: 'pipe' }).trim() || 'origin';
    const remoteUrl = execSync(`git config --get remote.${remote}.url`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    return { branch, remote, remoteUrl };
  } catch (error) {
    return { branch: 'unknown', remote: 'origin', remoteUrl: 'unknown' };
  }
}

// Check push status
function checkPushStatus() {
  try {
    const status = execSync('git status --porcelain=v1 -b', { encoding: 'utf8', stdio: 'pipe' });
    const lines = status.split('\n');
    const branchLine = lines[0];
    
    let ahead = 0;
    let behind = 0;
    
    const aheadMatch = branchLine.match(/ahead (\d+)/);
    const behindMatch = branchLine.match(/behind (\d+)/);
    
    if (aheadMatch) ahead = parseInt(aheadMatch[1]);
    if (behindMatch) behind = parseInt(behindMatch[1]);
    
    return { ahead, behind };
  } catch (error) {
    return { ahead: 0, behind: 0 };
  }
}

// Show help information
function showHelp() {
  console.log(chalk.bold.green(`
🚀 gpush - Enhanced Git Push with Safety Checks
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gpush')}                     ${chalk.gray('# Push commits to remote repository')}`);
  console.log(`   ${chalk.green('gpush --force')}             ${chalk.gray('# Force push (overwrites remote)')}`);
  console.log(`   ${chalk.green('gpush --upstream')}          ${chalk.gray('# Set upstream branch and push')}`);
  console.log(`   ${chalk.green('gpush --help')}              ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Validates repository state before pushing`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Tracking:')} Sets up upstream branches automatically`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Progress Display:')} Shows detailed push operation progress`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Force Push Safety:')} Warns about dangerous operations`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Conflict Detection:')} Identifies push conflicts early`);
  
  console.log(chalk.cyan('\n⚠️  FORCE PUSH WARNING:'));
  console.log(`   ${chalk.red('•')} Force push can overwrite commits on remote`);
  console.log(`   ${chalk.red('•')} This can cause data loss for other developers`);
  console.log(`   ${chalk.red('•')} Only use when you\'re certain it\'s safe`);
  console.log(`   ${chalk.red('•')} Consider using --force-with-lease instead`);
  
  console.log(chalk.cyan('\n💡 COMMON SCENARIOS:'));
  console.log(`   ${chalk.blue('•')} ${chalk.white('First push:')} Use ${chalk.green('gpush --upstream')} for new branches`);
  console.log(`   ${chalk.blue('•')} ${chalk.white('Regular push:')} Just use ${chalk.green('gpush')} after commits`);
  console.log(`   ${chalk.blue('•')} ${chalk.white('Push conflicts:')} Use ${chalk.green('gpull')} first to sync`);
  console.log(`   ${chalk.blue('•')} ${chalk.white('Amended commits:')} May need ${chalk.green('gpush --force')}`);
  
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
    const forceMode = args.includes('--force');
    const upstreamMode = args.includes('--upstream');
    
    const repoInfo = getRepositoryInfo();
    const pushStatus = checkPushStatus();
    
    console.log(chalk.bold.green('\n🚀 Preparing to Push'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue('Branch:'), chalk.white(repoInfo.branch));
    console.log(chalk.blue('Remote:'), chalk.white(repoInfo.remote));
    
    // Check if there are commits to push
    if (pushStatus.ahead === 0 && pushStatus.behind === 0) {
      console.log(chalk.yellow('\n� Repository Status: Up to date'));
      console.log(chalk.gray('   No commits to push'));
      console.log(chalk.blue('\n💡 Next steps:'));
      console.log(chalk.gray('   • Make some changes and commit them'));
      console.log(chalk.gray('   • Or check status with: gstatus'));
      return;
    }
    
    if (pushStatus.ahead > 0) {
      console.log(chalk.green(`📤 Commits to push: ${pushStatus.ahead}`));
    }
    
    if (pushStatus.behind > 0 && !forceMode) {
      console.log(chalk.red(`⚠️  Behind remote by: ${pushStatus.behind} commits`));
      console.log(chalk.yellow('\n💡 Recommendation:'));
      console.log(chalk.gray('   • Run gpull first to sync with remote'));
      console.log(chalk.gray('   • Then try gpush again'));
      console.log(chalk.gray('   • Or use gpush --force (⚠️  dangerous!)'));
      process.exit(1);
    }
    
    // Execute push
    let pushCommand;
    let description;
    
    if (forceMode) {
      console.log(chalk.red.bold('\n⚠️  FORCE PUSH MODE'));
      console.log(chalk.yellow('This will overwrite remote commits!'));
      pushCommand = 'git push --force-with-lease';
      description = 'Force pushing to remote (safer than --force)';
    } else if (upstreamMode) {
      pushCommand = `git push -u ${repoInfo.remote} ${repoInfo.branch}`;
      description = 'Setting upstream and pushing';
    } else {
      pushCommand = 'git push';
      description = 'Pushing to remote repository';
    }
    
    console.log(chalk.cyan.bold('\n📤 Pushing Changes'));
    console.log(chalk.gray('─'.repeat(40)));
    
    const result = runGitCommand(pushCommand, description);
    
    if (result.success) {
      console.log(chalk.green.bold('\n✅ Push completed successfully!'));
      console.log(chalk.blue('💡 Your changes are now available on the remote repository'));
      
      if (upstreamMode) {
        console.log(chalk.green('� Upstream branch set - future pushes can use just: gpush'));
      }
      
      console.log(chalk.blue('\n💡 Next steps:'));
      console.log(chalk.gray('   • Continue development work'));
      console.log(chalk.gray('   • Check remote repository to verify changes'));
      console.log(chalk.gray('   • Collaborate with team members'));
      
    } else {
      if (result.error.includes('has no upstream branch')) {
        console.log(chalk.yellow('\n💡 No upstream branch set'));
        console.log(chalk.blue('Try: gpush --upstream to set upstream and push'));
      } else if (result.error.includes('rejected')) {
        console.log(chalk.yellow('\n💡 Push was rejected'));
        console.log(chalk.blue('Try: gpull first to sync with remote'));
        console.log(chalk.gray('Or: gpush --force if you\'re sure (⚠️  dangerous)'));
      } else {
        console.log(chalk.red.bold('\n❌ Push failed!'));
        console.log(chalk.yellow('💡 Common solutions:'));
        console.log(chalk.gray('   • Check network connection'));
        console.log(chalk.gray('   • Verify repository access permissions'));
        console.log(chalk.gray('   • Try gpull to sync with remote first'));
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Push operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
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
