#!/usr/bin/env node

/**
 * gstash - Enhanced Git Stash Management
 * 
 * Features:
 * - Smart stash creation with descriptive messages
 * - Selective file stashing
 * - Stash list management with previews
 * - Untracked file handling
 * - Stash metadata tracking
 * 
 * Usage:
 *   gstash                - Stash all changes
 *   gstash "message"      - Stash with custom message
 *   gstash --list         - List all stashes
 *   gstash --partial      - Interactive partial stashing
 *   gstash --help         - Show this help
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
  console.log(chalk.magenta.bold('\n💾 gstash - Stash Uncommitted Changes\n'));
  console.log(chalk.cyan('Purpose:'), 'Temporarily store uncommitted changes in a stack, allowing clean working directory while preserving work.\n');
  
  console.log(chalk.cyan('Command:'), chalk.white('gstash [options] [message]\n'));
  
  console.log(chalk.cyan('Parameters:'));
  console.log('  ' + chalk.white('[message]') + ' - Optional descriptive message for the stash\n');
  
  console.log(chalk.cyan('Essential Options:'));
  console.log('  ' + chalk.green('--list') + '                  - List all stashes with details');
  console.log('  ' + chalk.green('-u, --include-untracked') + '  - Include untracked files in stash');
  console.log('  ' + chalk.green('-a, --all') + '              - Include all files (untracked and ignored)');
  console.log('  ' + chalk.green('-k, --keep-index') + '       - Keep staged changes in index');
  console.log('  ' + chalk.green('-p, --patch') + '            - Interactive patch mode for selective stashing');
  console.log('  ' + chalk.green('--pathspec-from-file') + '    - Read pathspec from file');
  console.log('  ' + chalk.green('-q, --quiet') + '            - Operate quietly, suppress output');
  console.log('  ' + chalk.green('-h, --help') + '             - Show detailed help information\n');
  
  console.log(chalk.cyan('Advanced Options:'));
  console.log('  ' + chalk.green('--staged') + '               - Stash only staged changes');
  console.log('  ' + chalk.green('--worktree') + '             - Stash only working tree changes');
  console.log('  ' + chalk.green('--index') + '                - Try to reinstate index as well');
  console.log('  ' + chalk.green('-- <pathspec>...') + '       - Stash specific files or directories\n');
  
  console.log(chalk.cyan('Common Use Cases:'));
  console.log(chalk.white('  gstash') + '                     # Stash all changes with auto-generated message');
  console.log(chalk.white('  gstash "work in progress"') + '  # Stash with custom message');
  console.log(chalk.white('  gstash -u "backup all"') + '    # Include untracked files');
  console.log(chalk.white('  gstash --keep-index') + '       # Stash but keep staged changes');
  console.log(chalk.white('  gstash -p') + '                 # Interactive selective stashing');
  console.log(chalk.white('  gstash --list') + '             # View all stashes');
  console.log(chalk.white('  gstash -- src/') + '            # Stash only files in src/ directory\n');
  
  console.log(chalk.cyan('💡 Workflow Tips:'));
  console.log('  • Use descriptive messages to identify stashes later');
  console.log('  • ' + chalk.yellow('gstash --list') + ' shows all stashes with timestamps');
  console.log('  • Use ' + chalk.yellow('gpop') + ' to apply and remove latest stash');
  console.log('  • ' + chalk.yellow('--keep-index') + ' useful when you want to commit staged changes');
  console.log('  • ' + chalk.yellow('--include-untracked') + ' captures new files not yet tracked\n');
  
  console.log(chalk.cyan('⚠️  Important Notes:'));
  console.log('  • Stashes are local to your repository');
  console.log('  • Use ' + chalk.yellow('git stash apply') + ' to apply without removing from stack');
  console.log('  • ' + chalk.yellow('git reflog show --format="%C(blue)%gd %C(red)%h%C(reset) %gs" refs/stash') + ' shows stash history');
  console.log('  • Stashes can accumulate - clean up old ones periodically');
  console.log('\n' + chalk.gray('═'.repeat(60)));
}

// Check if there are changes to stash
function hasChangesToStash() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Generate automatic stash message
function generateAutoMessage() {
  const branch = getCurrentBranch();
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `WIP on ${branch} at ${timestamp}`;
}

// Get stash statistics
function getStashStats() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = status.trim().split('\n').filter(line => line.length > 0);
    
    let staged = 0, modified = 0, untracked = 0;
    
    lines.forEach(line => {
      const statusCode = line.substring(0, 2);
      if (statusCode[0] !== ' ' && statusCode[0] !== '?') staged++;
      if (statusCode[1] === 'M' || statusCode[1] === 'D') modified++;
      if (statusCode === '??') untracked++;
    });
    
    return { staged, modified, untracked, total: lines.length };
  } catch (error) {
    return { staged: 0, modified: 0, untracked: 0, total: 0 };
  }
}

// List stashes with details
function listStashes() {
  try {
    const stashList = execSync('git stash list', { encoding: 'utf8' });
    
    if (!stashList.trim()) {
      console.log(chalk.yellow('\n📝 No stashes found'));
      console.log(chalk.cyan('💡 Create a stash with:'), chalk.green('gstash "message"'));
      return;
    }
    
    console.log(chalk.bold.magenta('\n💾 Git Stashes'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const stashes = stashList.trim().split('\n');
    stashes.forEach((stash, index) => {
      const parts = stash.split(': ');
      const stashRef = parts[0];
      const message = parts.slice(1).join(': ');
      
      console.log(chalk.blue(`${index + 1}.`), chalk.white(stashRef));
      console.log(chalk.gray(`   ${message}`));
      
      // Try to show file count
      try {
        const files = execSync(`git stash show --name-only ${stashRef}`, { encoding: 'utf8' });
        const fileCount = files.trim().split('\n').filter(f => f.trim()).length;
        console.log(chalk.gray(`   ${fileCount} file(s) affected`));
      } catch (error) {
        // Ignore if we can't get file info
      }
      
      console.log();
    });
    
    console.log(chalk.cyan('💡 Commands:'));
    console.log(chalk.gray(`   • Apply latest: ${chalk.green('gpop')}`));
    console.log(chalk.gray(`   • Apply specific: ${chalk.green('gpop stash@{1}')}`));
    console.log(chalk.gray(`   • Preview stash: ${chalk.green('gpop --preview')}`));
    console.log(chalk.gray(`   • Delete stash: ${chalk.green('git stash drop stash@{0}')}`));
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to list stashes:'), error.message);
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
    // List stashes if requested
    if (args.includes('--list')) {
      listStashes();
      return;
    }
    
    // Check if there are changes to stash
    if (!hasChangesToStash()) {
      console.log(chalk.yellow('\n📝 No changes to stash'));
      console.log(chalk.cyan('💡 Working directory is clean'));
      console.log(chalk.gray('Make some changes first, then use'), chalk.green('gstash'));
      return;
    }
    
    // Get stash options
    const includeUntracked = args.includes('--include-untracked') || args.includes('-u');
    const keepIndex = args.includes('--keep-index');
    const partial = args.includes('--partial');
    const customMessage = args.find(arg => !arg.startsWith('--'))?.trim();
    
    console.log(chalk.bold.magenta('\n💾 Git Stash'));
    console.log(chalk.gray('─'.repeat(40)));
    
    // Show what will be stashed
    const stats = getStashStats();
    console.log(chalk.blue('📊 Changes to stash:'));
    if (stats.staged > 0) console.log(chalk.green(`   • ${stats.staged} staged file(s)`));
    if (stats.modified > 0) console.log(chalk.yellow(`   • ${stats.modified} modified file(s)`));
    if (stats.untracked > 0) {
      if (includeUntracked) {
        console.log(chalk.blue(`   • ${stats.untracked} untracked file(s) (will be included)`));
      } else {
        console.log(chalk.gray(`   • ${stats.untracked} untracked file(s) (will be ignored)`));
        console.log(chalk.gray(`     Use ${chalk.green('--include-untracked')} to include them`));
      }
    }
    
    // Generate message
    const message = customMessage || generateAutoMessage();
    console.log(chalk.blue('💬 Message:'), chalk.white(`"${message}"`));
    
    if (keepIndex) {
      console.log(chalk.blue('📋 Mode:'), chalk.white('Keep staged changes'));
    }
    
    // Build stash command
    let stashCommand = 'git stash push';
    
    if (message) {
      stashCommand += ` -m "${message}"`;
    }
    
    if (includeUntracked) {
      stashCommand += ' -u';
    }
    
    if (keepIndex) {
      stashCommand += ' --keep-index';
    }
    
    if (partial) {
      stashCommand += ' --patch';
      console.log(chalk.cyan('\n🎯 Interactive mode: Select which changes to stash'));
    }
    
    console.log(chalk.blue('\n💾 Creating stash...'));
    
    // Create the stash
    runGitCommand(stashCommand, 'Changes stashed successfully');
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • List stashes: ${chalk.green('gstash --list')}`));
    console.log(chalk.gray(`   • Apply stash: ${chalk.green('gpop')}`));
    console.log(chalk.gray(`   • Switch branches: ${chalk.green('gcheckout branch-name')}`));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Stash operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('not a git repository')) {
      console.log(chalk.yellow('💡 Initialize repository with: git init'));
    } else if (error.message.includes('no changes')) {
      console.log(chalk.yellow('💡 No changes to stash'));
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

  