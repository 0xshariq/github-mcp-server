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
  console.log(chalk.bold.magenta(`
📦 gpop - Enhanced Git Stash Pop & Management
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gpop')}                      ${chalk.gray('# Apply most recent stash')}`);
  console.log(`   ${chalk.green('gpop --list')}               ${chalk.gray('# List all available stashes')}`);
  console.log(`   ${chalk.green('gpop stash@{0}')}            ${chalk.gray('# Apply specific stash by index')}`);
  console.log(`   ${chalk.green('gpop --preview')}            ${chalk.gray('# Preview stash contents before applying')}`);
  console.log(`   ${chalk.green('gpop --keep')}               ${chalk.gray('# Apply stash but keep it in stash list')}`);
  console.log(`   ${chalk.green('gpop --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Application:')} Detects conflicts and provides guidance`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Warns about uncommitted changes`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Stash Selection:')} Apply specific stashes by index`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Preview Mode:')} See stash contents before applying`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Keep Option:')} Apply without removing from stash list`);
  
  console.log(chalk.cyan('\n💡 STASH WORKFLOW:'));
  console.log(`   ${chalk.blue('Save Work:')} ${chalk.green('gstash "work in progress"')} - Save current changes`);
  console.log(`   ${chalk.blue('Switch Context:')} ${chalk.green('gcheckout "other-branch"')} - Work on something else`);
  console.log(`   ${chalk.blue('Return:')} ${chalk.green('gcheckout "original-branch"')} - Back to original work`);
  console.log(`   ${chalk.blue('Restore:')} ${chalk.green('gpop')} - Apply saved changes`);
  
  console.log(chalk.cyan('\n⚡ COMMON OPERATIONS:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gpop --list')} - See all stashes`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gpop --preview')} - Preview latest stash`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gpop')} - Apply latest stash`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gpop stash@{1}')} - Apply specific stash`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
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
  
