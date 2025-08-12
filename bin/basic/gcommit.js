#!/usr/bin/env node

/**
 * gcommit - Enhanced Git Commit with Validation
 * 
 * Features:
 * - Message length validation
 * - Repository safety checks
 * - Beautiful progress display
 * - Commit confirmation
 * 
 * Usage:
 *   gcommit "commit message"    - Commit staged changes
 *   gcommit --amend "message"   - Amend last commit
 *   gcommit --help              - Show help
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
function runGitCommand(command, description) {
  try {
    console.log(chalk.cyan(`🔧 ${description}...`));
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit'
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
💾 gcommit - Enhanced Git Commit with Validation
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gcommit "commit message"')}    ${chalk.gray('# Commit staged changes')}`);
  console.log(`   ${chalk.green('gcommit --amend "message"')}   ${chalk.gray('# Amend the last commit')}`);
  console.log(`   ${chalk.green('gcommit --help')}             ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Message Validation:')} Ensures commit messages meet best practices`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Verifies repository state before committing`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Progress Display:')} Shows detailed commit operation progress`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Amend Support:')} Can modify the last commit message`);
  
  console.log(chalk.cyan('\n💡 COMMIT MESSAGE GUIDELINES:'));
  console.log(`   ${chalk.blue('•')} Keep first line under 72 characters`);
  console.log(`   ${chalk.blue('•')} Use imperative mood (e.g., "Add feature" not "Added feature")`);
  console.log(`   ${chalk.blue('•')} Be descriptive but concise`);
  console.log(`   ${chalk.blue('•')} Reference issues when applicable`);
  
  console.log(chalk.cyan('\n📝 GOOD EXAMPLES:'));
  console.log(`   ${chalk.green('gcommit "Add user authentication system"')}`);
  console.log(`   ${chalk.green('gcommit "Fix memory leak in data processing"')}`);
  console.log(`   ${chalk.green('gcommit "Update documentation for API v2"')}`);
  console.log(`   ${chalk.green('gcommit "Refactor database connection logic"')}`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Validate commit message
function validateMessage(message) {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Commit message cannot be empty' };
  }
  
  if (message.trim().length < 3) {
    return { valid: false, error: 'Commit message must be at least 3 characters long' };
  }
  
  const firstLine = message.split('\n')[0];
  if (firstLine.length > 100) {
    return { 
      valid: false, 
      error: 'First line should be under 100 characters for better readability' 
    };
  }
  
  return { valid: true };
}

// Check if there are staged changes
function hasStagedChanges() {
  try {
    const result = execSync('git diff --cached --name-only', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    return result.trim().length > 0;
  } catch {
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
  
  // Check for amend flag
  const amendMode = args.includes('--amend');
  const messageArgs = amendMode ? args.filter(arg => arg !== '--amend') : args;
  
  // Check if commit message is provided
  if (messageArgs.length === 0) {
    console.log(chalk.red('❌ Commit message required'));
    console.log(chalk.yellow('💡 Usage: gcommit "your commit message"'));
    console.log(chalk.gray('💡 Or: gcommit --amend "new message" to amend last commit'));
    console.log(chalk.gray('💡 Run: gcommit --help for more information'));
    process.exit(1);
  }
  
  const commitMessage = messageArgs.join(' ');
  
  // Validate commit message
  const validation = validateMessage(commitMessage);
  if (!validation.valid) {
    console.log(chalk.red('❌'), validation.error);
    console.log(chalk.yellow('💡 Please provide a more descriptive commit message'));
    console.log(chalk.gray('💡 Run: gcommit --help for guidelines'));
    process.exit(1);
  }
  
  try {
    if (amendMode) {
      // Amend last commit
      console.log(chalk.bold.yellow('\n📝 Amending Last Commit'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('New message:'), chalk.white(`"${commitMessage}"`));
      
      const result = runGitCommand(`git commit --amend -m "${commitMessage}"`, 'Amending last commit');
      
      if (result.success) {
        console.log(chalk.green.bold('\n✅ Commit amended successfully!'));
        console.log(chalk.blue('💡 Note: If already pushed, you\'ll need to force push'));
        console.log(chalk.gray(`   Use: ${chalk.green('git push --force-with-lease')}`));
      } else {
        console.log(chalk.red.bold('\n❌ Failed to amend commit!'));
        process.exit(1);
      }
      
    } else {
      // Regular commit
      if (!hasStagedChanges()) {
        console.log(chalk.yellow('⚠️  No staged changes to commit'));
        console.log(chalk.blue('💡 Stage changes first with:'));
        console.log(chalk.gray(`   • ${chalk.green('gadd .')} - Stage all changes`));
        console.log(chalk.gray(`   • ${chalk.green('gadd file.js')} - Stage specific files`));
        console.log(chalk.gray(`   • ${chalk.green('gstatus')} - Check what needs staging`));
        process.exit(1);
      }
      
      console.log(chalk.bold.blue('\n💾 Creating Commit'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('Message:'), chalk.white(`"${commitMessage}"`));
      console.log(chalk.blue('Length:'), chalk.white(`${commitMessage.length} characters`));
      
      const result = runGitCommand(`git commit -m "${commitMessage}"`, 'Creating commit');
      
      if (result.success) {
        console.log(chalk.green.bold('\n✅ Commit created successfully!'));
        console.log(chalk.blue('💡 Next steps:'));
        console.log(chalk.gray(`   • ${chalk.green('gpush')} - Push to remote repository`));
        console.log(chalk.gray(`   • ${chalk.green('gstatus')} - Check repository status`));
        console.log(chalk.gray(`   • ${chalk.green('glog')} - View commit history`));
      } else {
        console.log(chalk.red.bold('\n❌ Failed to create commit!'));
        console.log(chalk.yellow('💡 Check for any issues above and try again'));
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Unexpected error:'), error.message);
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
