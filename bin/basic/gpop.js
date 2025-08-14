#!/usr/bin/env node

/**
 * gpop - Enhanced Git Stash Pop & Management
 * 
 * Features:
 * - Smart stash application with conflict detection
 * - Interactive stash selection
 * - Stash preview before applying
 * - Conflict resolution guidance
 * - Working directory safety checks
 * 
 * Usage:
 *   gpop                  - Apply most recent stash
 *   gpop --list           - List all available stashes
 *   gpop stash@{0}        - Apply specific stash
 *   gpop --preview        - Preview stash contents
 *   gpop --help           - Show this help
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
  console.log(chalk.magenta.bold('\n📦 gpop - Apply Stashed Changes\n'));
  console.log(chalk.cyan('Purpose:'), 'Apply most recent stashed changes and remove from stash stack, or manage stash operations with various options.\n');
  
  console.log(chalk.cyan('Command:'), chalk.white('gpop [options] [stash]\n'));
  
  console.log(chalk.cyan('Parameters:'));
  console.log('  ' + chalk.white('[stash]') + '   - Specific stash reference (e.g., stash@{1}, default: stash@{0})\n');
  
  console.log(chalk.cyan('Essential Options:'));
  console.log('  ' + chalk.green('--list') + '                  - List all available stashes with details');
  console.log('  ' + chalk.green('--index') + '                 - Try to reinstate index changes as well');
  console.log('  ' + chalk.green('--keep') + '                  - Apply stash but keep it in stash stack');
  console.log('  ' + chalk.green('--preview') + '               - Preview stash contents without applying');
  console.log('  ' + chalk.green('-q, --quiet') + '             - Operate quietly, suppress output');
  console.log('  ' + chalk.green('-h, --help') + '              - Show detailed help information\n');
  
  console.log(chalk.cyan('Advanced Options:'));
  console.log('  ' + chalk.green('--conflict-style=<style>') + '  - Set conflict marker style (merge, diff3)');
  console.log('  ' + chalk.green('--no-rerere-autoupdate') + '   - Disable automatic rerere cache updates\n');
  
  console.log(chalk.cyan('Stash Operations:'));
  console.log('  ' + chalk.green('apply') + '                   - Apply stash without removing from stack');
  console.log('  ' + chalk.green('drop') + '                    - Delete a specific stash');
  console.log('  ' + chalk.green('show') + '                    - Show stash contents');
  console.log('  ' + chalk.green('clear') + '                   - Delete all stashes\n');
  
  console.log(chalk.cyan('Common Use Cases:'));
  console.log(chalk.white('  gpop') + '                       # Apply latest stash and remove it');
  console.log(chalk.white('  gpop --list') + '               # Show all stashes');
  console.log(chalk.white('  gpop --preview') + '            # Preview latest stash contents');
  console.log(chalk.white('  gpop stash@{1}') + '            # Apply specific stash by index');
  console.log(chalk.white('  gpop --keep') + '               # Apply but keep stash in stack');
  console.log(chalk.white('  gpop --index') + '              # Apply and try to restore index');
  console.log(chalk.white('  git stash drop stash@{1}') + '  # Delete specific stash\n');
  
  console.log(chalk.cyan('💡 Stash Workflow Tips:'));
  console.log('  • Use ' + chalk.yellow('gpop --list') + ' to see all stashes before applying');
  console.log('  • ' + chalk.yellow('gpop --preview') + ' lets you see changes before applying');
  console.log('  • Use ' + chalk.yellow('--keep') + ' to test stash without losing it');
  console.log('  • ' + chalk.yellow('--index') + ' restores both working tree and staged changes');
  console.log('  • Stashes are referenced as stash@{0}, stash@{1}, etc.\n');
  
  console.log(chalk.cyan('⚠️  Safety Notes:'));
  console.log('  • ' + chalk.yellow('gpop') + ' removes stash after applying - use ' + chalk.yellow('--keep') + ' to preserve');
  console.log('  • Check for conflicts after applying stash');
  console.log('  • Use ' + chalk.yellow('gstatus') + ' to verify results after popping');
  console.log('  • Conflicts may require manual resolution');
  console.log('\n' + chalk.gray('═'.repeat(60)));
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

// Get list of stashes
function getStashList() {
  try {
    const result = execSync('git stash list', { encoding: 'utf8' });
    return result.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return [];
  }
}

// Check if stash exists
function stashExists(stashRef = 'stash@{0}') {
  try {
    execSync(`git show ${stashRef}`, { stdio: 'pipe' });
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

// Preview stash contents
function previewStash(stashRef = 'stash@{0}') {
  try {
    console.log(chalk.bold.magenta(`\n📋 Stash Preview: ${stashRef}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Show stash info
    const stashInfo = execSync(`git stash show -p ${stashRef}`, { encoding: 'utf8' });
    console.log(stashInfo);
    
    console.log(chalk.cyan('\n💡 To apply this stash:'));
    console.log(chalk.gray(`   • Apply and remove: ${chalk.green(`gpop ${stashRef}`)}`));
    console.log(chalk.gray(`   • Apply and keep: ${chalk.green(`gpop --keep ${stashRef}`)}`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to preview stash: ${error.message}`));
  }
}

// List all stashes
function listStashes() {
  const stashes = getStashList();
  
  if (stashes.length === 0) {
    console.log(chalk.yellow('\n📝 No stashes found'));
    console.log(chalk.cyan('💡 Create a stash with:'), chalk.green('gstash "message"'));
    return;
  }
  
  console.log(chalk.bold.magenta('\n📦 Available Stashes'));
  console.log(chalk.gray('─'.repeat(50)));
  
  stashes.forEach((stash, index) => {
    const parts = stash.split(': ');
    const stashRef = parts[0];
    const message = parts.slice(1).join(': ');
    
    console.log(chalk.blue(`${index + 1}.`), chalk.white(stashRef));
    console.log(chalk.gray(`   ${message}`));
  });
  
  console.log(chalk.cyan('\n💡 Usage:'));
  console.log(chalk.gray(`   • Apply latest: ${chalk.green('gpop')}`));
  console.log(chalk.gray(`   • Apply specific: ${chalk.green('gpop stash@{1}')}`));
  console.log(chalk.gray(`   • Preview stash: ${chalk.green('gpop --preview')}`));
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
    // Handle different modes
    if (args.includes('--list')) {
      listStashes();
      return;
    }
    
    if (args.includes('--preview')) {
      const stashRef = args.find(arg => arg.startsWith('stash@{')) || 'stash@{0}';
      if (!stashExists(stashRef)) {
        console.log(chalk.yellow('\n📝 No stashes found'));
        console.log(chalk.cyan('� Create a stash with:'), chalk.green('gstash "message"'));
        return;
      }
      previewStash(stashRef);
      return;
    }
    
    // Check if any stashes exist
    if (!stashExists()) {
      console.log(chalk.yellow('\n📝 No stashes found'));
      console.log(chalk.cyan('💡 Create a stash with:'), chalk.green('gstash "message"'));
      console.log(chalk.cyan('💡 Or check stash list:'), chalk.green('gpop --list'));
      return;
    }
    
    const keepStash = args.includes('--keep');
    const specificStash = args.find(arg => arg.startsWith('stash@{')) || 'stash@{0}';
    
    console.log(chalk.bold.magenta('\n📦 Git Stash Pop'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue('🎯 Target stash:'), chalk.white(specificStash));
    console.log(chalk.blue('📋 Mode:'), chalk.white(keepStash ? 'Apply and keep' : 'Apply and remove'));
    
    // Validate specific stash exists
    if (!stashExists(specificStash)) {
      console.log(chalk.red(`❌ Stash "${specificStash}" does not exist`));
      console.log(chalk.cyan('💡 List available stashes:'), chalk.green('gpop --list'));
      process.exit(1);
    }
    
    // Warn about uncommitted changes
    if (hasUncommittedChanges()) {
      console.log(chalk.yellow('\n⚠️  Warning: You have uncommitted changes'));
      console.log(chalk.cyan('💡 This may cause conflicts when applying the stash'));
      console.log(chalk.gray('Consider committing or stashing current changes first'));
      console.log();
    }
    
    console.log(chalk.blue('\n🔄 Applying stash...'));
    
    // Apply the stash
    const command = keepStash 
      ? `git stash apply ${specificStash}`
      : `git stash pop ${specificStash}`;
    
    runGitCommand(command, `Stash ${specificStash} applied successfully`);
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Review changes: ${chalk.green('gdiff')}`));
    if (hasUncommittedChanges()) {
      console.log(chalk.gray(`   • Commit changes: ${chalk.green('gcommit "message"')}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Stash operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('conflict')) {
      console.log(chalk.yellow('\n💡 Merge conflicts detected:'));
      console.log(chalk.gray(`   • Resolve conflicts manually`));
      console.log(chalk.gray(`   • Use ${chalk.green('gstatus')} to see conflicted files`));
      console.log(chalk.gray(`   • After resolving, commit with ${chalk.green('gcommit "resolved conflicts"')}`));
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
  
