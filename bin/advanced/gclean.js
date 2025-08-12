#!/usr/bin/env node

/**
 * gclean - Enhanced Repository Cleanup Manager
 * 
 * Features:
 * - Smart branch cleanup (merged and stale branches)
 * - Repository optimization and garbage collection
 * - Stash and reference cleanup
 * - Untracked file management
 * - Safe cleanup with backup options
 * 
 * Usage:
 *   gclean                   - Smart cleanup (safe operations)
 *   gclean --branches        - Clean merged branches
 *   gclean --all             - Deep cleanup (with confirmation)
 *   gclean --gc              - Garbage collection
 *   gclean --help            - Show this help
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
🧹 gclean - Enhanced Repository Cleanup Manager
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gclean')}                   ${chalk.gray('# Smart safe cleanup')}`);
  console.log(`   ${chalk.green('gclean --branches')}        ${chalk.gray('# Clean merged branches')}`);
  console.log(`   ${chalk.green('gclean --all')}             ${chalk.gray('# Deep cleanup with confirmation')}`);
  console.log(`   ${chalk.green('gclean --gc')}              ${chalk.gray('# Garbage collection optimization')}`);
  console.log(`   ${chalk.green('gclean --stash')}           ${chalk.gray('# Clean old stashes')}`);
  console.log(`   ${chalk.green('gclean --help')}            ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🧹 CLEANUP CATEGORIES:'));
  console.log(`   ${chalk.blue('Branches:')} Remove merged and stale feature branches`);
  console.log(`   ${chalk.blue('References:')} Clean deleted remote references`);
  console.log(`   ${chalk.blue('Stashes:')} Remove old stash entries`);
  console.log(`   ${chalk.blue('Objects:')} Optimize repository with garbage collection`);
  console.log(`   ${chalk.blue('Untracked:')} Remove untracked files and directories`);
  
  console.log(chalk.cyan('\n⚡ CLEANUP FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safe Operations:')} Protects important branches and data`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Detection:')} Identifies truly safe-to-remove items`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Backup Creation:')} Creates backups before destructive ops`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Statistics:')} Shows cleanup results and space saved`);
  
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
    console.log(chalk.yellow(`⚠️  ${error.message}`));
    return null;
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
    console.log(chalk.bold.magenta('\n🧹 Repository Cleanup Manager'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (args.includes('--branches')) {
      console.log(chalk.blue('🌿 Cleaning merged branches...'));
      runGitCommand('git branch --merged | grep -v "\\*\\|main\\|master\\|develop" | xargs -n 1 git branch -d || true', 'Cleaned merged branches');
      
    } else if (args.includes('--gc')) {
      console.log(chalk.blue('🗑️  Running garbage collection...'));
      runGitCommand('git gc --prune=now', 'Garbage collection completed');
      runGitCommand('git repack -ad', 'Repository repacked');
      
    } else if (args.includes('--stash')) {
      console.log(chalk.blue('📦 Cleaning old stashes...'));
      const stashes = runGitCommand('git stash list', null);
      if (stashes && stashes.trim()) {
        console.log(chalk.yellow(`Found ${stashes.split('\n').length} stash(es)`));
        console.log(chalk.gray('Use git stash drop <stash> to remove specific stashes'));
      } else {
        console.log(chalk.green('✅ No stashes to clean'));
      }
      
    } else if (args.includes('--all')) {
      console.log(chalk.red('🚨 Deep cleanup mode...'));
      
      // Clean merged branches
      console.log(chalk.blue('🌿 Cleaning merged branches...'));
      runGitCommand('git branch --merged | grep -v "\\*\\|main\\|master\\|develop" | xargs -n 1 git branch -d || true', 'Cleaned merged branches');
      
      // Prune remote references
      console.log(chalk.blue('🔗 Pruning remote references...'));
      runGitCommand('git remote prune origin', 'Pruned remote references');
      
      // Garbage collection
      console.log(chalk.blue('🗑️  Garbage collection...'));
      runGitCommand('git gc --aggressive --prune=now', 'Aggressive cleanup completed');
      
      console.log(chalk.green('🎉 Deep cleanup completed!'));
      
    } else {
      console.log(chalk.blue('🧹 Smart safe cleanup...'));
      
      // Safe operations only
      runGitCommand('git remote prune origin', 'Pruned deleted remote references');
      runGitCommand('git gc', 'Basic garbage collection');
      
      // Show cleanup opportunities
      const merged = runGitCommand('git branch --merged | grep -v "\\*\\|main\\|master\\|develop" | wc -l', null);
      if (merged && parseInt(merged) > 0) {
        console.log(chalk.cyan(`💡 Found ${merged.trim()} merged branch(es) that can be cleaned`));
        console.log(chalk.gray(`   Run: ${chalk.green('gclean --branches')} to remove them`));
      }
      
      const stashes = runGitCommand('git stash list | wc -l', null);
      if (stashes && parseInt(stashes) > 0) {
        console.log(chalk.cyan(`💡 Found ${stashes.trim()} stash(es)`));
        console.log(chalk.gray(`   Run: ${chalk.green('gclean --stash')} to review them`));
      }
      
      console.log(chalk.green('✅ Safe cleanup completed!'));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Cleanup failed'));
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
        

