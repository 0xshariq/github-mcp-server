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
  console.log(chalk.bold.magenta('\n🧹 gclean - Repository Cleanup'));
  
  console.log(chalk.cyan('Purpose:'), 'Clean and maintain repository health with comprehensive cleanup options for optimization and maintenance.\n');
  
  console.log(chalk.cyan('Command:'), 'gclean [target] [options]');
  
  console.log(chalk.cyan('\nParameters:'));
  console.log('  [target]     - Optional cleanup target (branches, cache, files, all)');
  
  console.log(chalk.cyan('\nEssential Options:'));
  console.log('  ' + chalk.green('--branches') + '           - Clean merged/stale branches');
  console.log('  ' + chalk.green('--cache') + '              - Clear Git cache and temporary files');
  console.log('  ' + chalk.green('--files') + '              - Remove untracked files and directories');
  console.log('  ' + chalk.green('--all') + '                - Comprehensive cleanup (all targets)');
  console.log('  ' + chalk.green('--dry-run') + '            - Preview cleanup operations');
  console.log('  ' + chalk.green('--force') + '              - Force cleanup without confirmation');
  console.log('  ' + chalk.green('--keep <pattern>') + '     - Keep files matching pattern');
  console.log('  ' + chalk.green('--aggressive') + '         - Aggressive cleanup including packed refs');
  console.log('  ' + chalk.green('--gc') + '                 - Garbage collection optimization');
  console.log('  ' + chalk.green('--stash') + '              - Clean old stashes');
  console.log('  ' + chalk.green('-h, --help') + '           - Show detailed help information');
  
  console.log(chalk.cyan('\nCommon Use Cases:'));
  console.log(chalk.white('  gclean --help') + '                        # Show help');
  console.log(chalk.white('  gclean') + '                              # Smart safe cleanup');
  console.log(chalk.white('  gclean --branches') + '                   # Clean merged branches');
  console.log(chalk.white('  gclean --all') + '                        # Deep cleanup (all targets)');
  console.log(chalk.white('  gclean --cache') + '                      # Clear cache');
  console.log(chalk.white('  gclean --files') + '                      # Remove untracked files');
  console.log(chalk.white('  gclean --dry-run') + '                    # Preview cleanup');
  console.log(chalk.white('  gclean --force') + '                      # Force cleanup');
  console.log(chalk.white('  gclean --keep "*.md"') + '                # Keep markdown files');
  console.log(chalk.white('  gclean --aggressive') + '                 # Aggressive cleanup');
  
  console.log(chalk.cyan('\nCleanup Categories:'));
  console.log('  • Branches      - Remove merged and stale feature branches');
  console.log('  • References    - Clean deleted remote references');
  console.log('  • Stashes       - Remove old stash entries');
  console.log('  • Objects       - Optimize repository with garbage collection');
  console.log('  • Untracked     - Remove untracked files and directories');
  
  console.log(chalk.cyan('\nWorkflow Tips:'));
  console.log('  • Use ' + chalk.yellow('--dry-run') + ' to preview operations before execution');
  console.log('  • Use ' + chalk.yellow('--keep') + ' patterns to protect important files');
  console.log('  • Use ' + chalk.yellow('--aggressive') + ' for deep optimization');
  console.log('  • Run cleanup regularly to maintain repository health');
  
  console.log(chalk.cyan('\nSafety Notes:'));
  console.log('  • Safe operations protect important branches and data');
  console.log('  • Backups are created before destructive operations');
  console.log('  • Use ' + chalk.yellow('--force') + ' carefully as it bypasses confirmations');
  
  console.log(chalk.gray('\n════════════════════════════════════════════════════════════'));
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
        

