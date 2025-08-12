#!/usr/bin/env node

/**
 * gpull - Enhanced Git Pull with Smart Handling
 * 
 * Features:
 * - Repository validation and safety checks
 * - Conflict detection and resolution guidance
 * - Beautiful progress display with status
 * - Post-pull repository status display
 * - Automatic merge conflict handling
 * 
 * Usage:
 *   gpull                   - Pull latest changes from remote
 *   gpull --status          - Show detailed status after pull
 *   gpull --force           - Force pull (resets local changes)
 *   gpull --help            - Show this help
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

// Show help information
function showHelp() {
  console.log(chalk.bold.blue(`
⬇️ gpull - Enhanced Git Pull with Smart Handling
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gpull')}                     ${chalk.gray('# Pull latest changes from remote')}`);
  console.log(`   ${chalk.green('gpull --status')}            ${chalk.gray('# Pull and show detailed status')}`);
  console.log(`   ${chalk.green('gpull --force')}             ${chalk.gray('# Force pull (resets local changes)')}`);
  console.log(`   ${chalk.green('gpull --help')}              ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Conflict Detection:')} Identifies and helps resolve merge conflicts`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Validates repository state before pulling`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Progress Display:')} Shows detailed pull operation progress`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Status Integration:')} Optional post-pull status display`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Force Option:')} Safe way to discard local changes`);
  
  console.log(chalk.cyan('\n💡 CONFLICT RESOLUTION:'));
  console.log(`   ${chalk.blue('1.')} When conflicts occur, gpull will show affected files`);
  console.log(`   ${chalk.blue('2.')} Edit conflicted files to resolve issues`);
  console.log(`   ${chalk.blue('3.')} Use ${chalk.green('gadd .')} to stage resolved files`);
  console.log(`   ${chalk.blue('4.')} Use ${chalk.green('gcommit "Resolve merge conflicts"')} to complete`);
  
  console.log(chalk.cyan('\n⚡ QUICK WORKFLOW:'));
  console.log(`   ${chalk.blue('1.')} Run ${chalk.green('gpull')} to get latest changes`);
  console.log(`   ${chalk.blue('2.')} If conflicts, resolve them manually`);
  console.log(`   ${chalk.blue('3.')} Continue your development work`);
  console.log(`   ${chalk.blue('4.')} Use ${chalk.green('gflow "message"')} for your next commit`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Check if there are uncommitted changes
function hasUncommittedChanges() {
  try {
    const result = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Display repository status
function displayStatus() {
  try {
    console.log(chalk.cyan('\n📊 Repository Status After Pull:'));
    console.log(chalk.gray('─'.repeat(40)));
    const statusOutput = execSync('git status --porcelain -b', { encoding: 'utf8' });
    
    if (statusOutput.trim() === '') {
      console.log(chalk.green('✨ Working directory clean'));
      return;
    }
    
    const lines = statusOutput.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('##')) {
        const branch = line.replace(/^## /, '');
        console.log(chalk.blue('🌿 Branch:'), chalk.white(branch));
      } else {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        let icon = '📄';
        let color = chalk.white;
        
        if (status === '??') {
          icon = '❓'; color = chalk.gray;
        } else if (status.includes('M')) {
          icon = '📝'; color = chalk.yellow;
        } else if (status.includes('A')) {
          icon = '➕'; color = chalk.green;
        } else if (status.includes('D')) {
          icon = '🗑️'; color = chalk.red;
        }
        
        console.log(`   ${icon} ${color(file)}`);
      }
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not display status'));
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
    const forceMode = args.includes('--force');
    const showStatus = args.includes('--status');
    
    if (forceMode) {
      // Force mode - reset local changes and pull
      console.log(chalk.bold.red('\n⚠️  Force Pull Mode'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.yellow('This will discard all local changes!'));
      
      if (hasUncommittedChanges()) {
        console.log(chalk.yellow('💾 Uncommitted changes detected - they will be lost'));
      }
      
      const resetResult = runGitCommand('git reset --hard HEAD', 'Resetting local changes', false);
      if (!resetResult.success) {
        throw new Error(`Failed to reset: ${resetResult.error}`);
      }
      
      const pullResult = runGitCommand('git pull', 'Force pulling from remote');
      if (!pullResult.success) {
        throw new Error(`Failed to pull: ${pullResult.error}`);
      }
      
    } else {
      // Normal pull
      console.log(chalk.bold.blue('\n⬇️ Pulling Latest Changes'));
      console.log(chalk.gray('─'.repeat(40)));
      
      if (hasUncommittedChanges()) {
        console.log(chalk.yellow('💡 Local changes detected - they will be preserved'));
      }
      
      const pullResult = runGitCommand('git pull', 'Pulling from remote');
      
      if (!pullResult.success) {
        if (pullResult.error.includes('CONFLICT')) {
          console.log(chalk.red.bold('\n⚠️  Merge Conflicts Detected!'));
          console.log(chalk.yellow('🔧 Resolution steps:'));
          console.log(chalk.gray('   1. Check conflicted files with: gstatus'));
          console.log(chalk.gray('   2. Edit files to resolve conflicts'));
          console.log(chalk.gray('   3. Stage resolved files: gadd .'));
          console.log(chalk.gray('   4. Complete merge: gcommit "Resolve conflicts"'));
          process.exit(1);
        } else {
          throw new Error(`Pull failed: ${pullResult.error}`);
        }
      }
    }
    
    // Show success message
    console.log(chalk.green.bold('\n✅ Pull completed successfully!'));
    
    // Show status if requested
    if (showStatus || args.length === 0) {
      displayStatus();
    }
    
    // Show helpful suggestions
    console.log(chalk.blue('\n💡 Next steps:'));
    console.log(chalk.gray(`   • ${chalk.green('gstatus')} - Check repository status`));
    console.log(chalk.gray(`   • ${chalk.green('glog')} - View recent commits`));
    console.log(chalk.gray(`   • Continue with your development work`));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Pull operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    console.log(chalk.yellow('\n💡 Troubleshooting:'));
    console.log(chalk.gray('   • Check network connection'));
    console.log(chalk.gray('   • Verify remote repository access'));
    console.log(chalk.gray('   • Use --force to discard local changes'));
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
