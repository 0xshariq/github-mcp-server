#!/usr/bin/env node

/**
 * gfix - Enhanced Quick Fix Manager
 * 
 * Features:
 * - Quick bug fix workflows
 * - Hotfix branch automation
 * - Commit amendment and correction
 * - Merge conflict resolution
 * - Repository issue detection
 * 
 * Usage:
 *   gfix "bug description"   - Quick fix commit
 *   gfix --hotfix "message"  - Create hotfix branch
 *   gfix --amend             - Amend last commit
 *   gfix --conflicts         - Resolve merge conflicts
 *   gfix --help              - Show this help
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

function validateRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Error: Not a git repository'));
    return false;
  }
}

function showHelp() {
  console.log(chalk.bold.magenta(`
🔧 gfix - Enhanced Quick Fix Manager
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gfix "fix login bug"')}       ${chalk.gray('# Quick fix with description')}`);
  console.log(`   ${chalk.green('gfix --hotfix "urgent fix"')} ${chalk.gray('# Create hotfix branch')}`);
  console.log(`   ${chalk.green('gfix --amend')}               ${chalk.gray('# Amend last commit')}`);
  console.log(`   ${chalk.green('gfix --conflicts')}           ${chalk.gray('# Resolve merge conflicts')}`);
  console.log(`   ${chalk.green('gfix --typo')}                ${chalk.gray('# Fix commit message typo')}`);
  console.log(`   ${chalk.green('gfix --help')}                ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🔧 FIX STRATEGIES:'));
  console.log(`   ${chalk.blue('Quick Fix:')} Fast commit for immediate bug fixes`);
  console.log(`   ${chalk.blue('Hotfix Branch:')} Emergency fixes on separate branches`);
  console.log(`   ${chalk.blue('Amendment:')} Modify the most recent commit`);
  console.log(`   ${chalk.blue('Conflict Resolution:')} Guided merge conflict solving`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gfix "resolve null pointer"')} - Quick bug fix`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gfix --hotfix "security patch"')} - Emergency hotfix`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gfix --amend')} - Add forgotten files to last commit`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gfix --conflicts')} - Resolve merge conflicts`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

function runGitCommand(command, successMessage) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (successMessage) {
      console.log(chalk.green(`✅ ${successMessage}`));
    }
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ ${error.message}`));
    throw error;
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'main';
  }
}

function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (!validateRepository()) {
    process.exit(1);
  }
  
  try {
    const hotfixMode = args.includes('--hotfix');
    const amendMode = args.includes('--amend');
    const conflictMode = args.includes('--conflicts');
    const typoMode = args.includes('--typo');
    const fixMessage = args.find(arg => !arg.startsWith('--'))?.trim();
    
    console.log(chalk.bold.magenta('\n🔧 Quick Fix Manager'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (hotfixMode) {
      console.log(chalk.red('🚨 Creating hotfix branch...'));
      const timestamp = new Date().toISOString().substring(0, 16).replace(/[T:]/g, '-');
      const branchName = `hotfix-${timestamp}`;
      
      const message = fixMessage || 'Emergency hotfix';
      runGitCommand(`git checkout -b ${branchName}`, `Created hotfix branch: ${branchName}`);
      
      if (hasUncommittedChanges()) {
        runGitCommand('git add .', 'Staged hotfix changes');
        runGitCommand(`git commit -m "HOTFIX: ${message}"`, 'Created hotfix commit');
      }
      
      console.log(chalk.cyan('\n💡 Hotfix branch ready for emergency fixes'));
      
    } else if (amendMode) {
      console.log(chalk.blue('📝 Amending last commit...'));
      
      if (hasUncommittedChanges()) {
        runGitCommand('git add .', 'Staged changes for amendment');
      }
      
      if (fixMessage) {
        runGitCommand(`git commit --amend -m "${fixMessage}"`, 'Amended commit with new message');
      } else {
        runGitCommand('git commit --amend --no-edit', 'Amended last commit');
      }
      
    } else if (conflictMode) {
      console.log(chalk.yellow('🔀 Resolving merge conflicts...'));
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (status.includes('UU')) {
        console.log(chalk.red('Found merge conflicts'));
        console.log(chalk.cyan('Opening merge resolution tool...'));
        runGitCommand('git mergetool || true', 'Opened merge tool');
        console.log(chalk.yellow('\n💡 After resolving conflicts, run: git commit'));
      } else {
        console.log(chalk.green('✅ No merge conflicts found'));
      }
      
    } else if (typoMode) {
      console.log(chalk.blue('✏️  Fixing commit message typo...'));
      runGitCommand('git commit --amend', 'Opening editor for commit message fix');
      
    } else if (fixMessage) {
      console.log(chalk.blue(`🐛 Creating quick fix: ${fixMessage}`));
      
      if (!hasUncommittedChanges()) {
        console.log(chalk.yellow('⚠️  No changes to commit'));
        console.log(chalk.gray('Make some changes first, then run the fix again'));
        return;
      }
      
      runGitCommand('git add .', 'Staged all changes');
      runGitCommand(`git commit -m "Fix: ${fixMessage}"`, 'Created fix commit');
      
      console.log(chalk.green('\n🎉 Quick fix completed!'));
      
    } else {
      console.log(chalk.blue('🔍 Running repository diagnostics...'));
      
      // Check for common issues
      const currentBranch = getCurrentBranch();
      console.log(chalk.cyan(`   • Current branch: ${currentBranch}`));
      
      if (hasUncommittedChanges()) {
        console.log(chalk.yellow('   ⚠️  Uncommitted changes detected'));
      } else {
        console.log(chalk.green('   ✅ Working directory clean'));
      }
      
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.includes('UU')) {
        console.log(chalk.red('   ❌ Merge conflicts detected'));
        console.log(chalk.gray(`   Run: ${chalk.green('gfix --conflicts')}`));
      } else {
        console.log(chalk.green('   ✅ No merge conflicts'));
      }
      
      console.log(chalk.cyan('\n💡 Available fixes:'));
      console.log(chalk.gray(`   • Quick fix: ${chalk.green('gfix "description"')}`));
      console.log(chalk.gray(`   • Hotfix: ${chalk.green('gfix --hotfix "urgent"')}`));
      console.log(chalk.gray(`   • Amend: ${chalk.green('gfix --amend')}`));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Fix operation failed'));
    console.log(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}

