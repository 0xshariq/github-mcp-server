#!/usr/bin/env node

/**
 * gflow - Enhanced Complete Git Workflow
 * 
 * Supports both specific files and full repository workflows:
 * - Add specific files or all changes
 * - Commit with message
 * - Push to remote
 * 
 * Usage:
 *   gflow "commit message"                    - Add all changes, commit, push
 *   gflow "commit message" file1.js file2.js - Add specific files, commit, push
 *   gflow "commit message" src/              - Add specific directory, commit, push
 *   gflow --help                            - Show this help
 * 
 * Features:
 * - Flexible file handling (with or without quotes)
 * - Repository validation and safety checks
 * - Detailed progress display with styling
 * - Automatic workflow execution
 */

import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

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
function runGitCommand(command, description, showOutput = false) {
  try {
    console.log(chalk.cyan(`   🔧 Running: ${command}`));
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: showOutput ? 'inherit' : 'pipe'
    });
    console.log(chalk.green('   ✓ Operation completed successfully!'));
    return { success: true, output: result };
  } catch (error) {
    console.log(chalk.red(`   ❌ Failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

// Show enhanced help
function showHelp() {
  console.log(chalk.bold.magenta(`
⚡ gflow - Enhanced Complete Git Workflow
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gflow "commit message"')}                    ${chalk.gray('# Add all changes, commit, push')}`);
  console.log(`   ${chalk.green('gflow "message" file1.js file2.js')}        ${chalk.gray('# Add specific files, commit, push')}`);
  console.log(`   ${chalk.green('gflow "message" src/ docs/')}               ${chalk.gray('# Add directories, commit, push')}`);
  console.log(`   ${chalk.green('gflow "fix: update API" package.json')}     ${chalk.gray('# Mix of files and directories')}`);
  
  console.log(chalk.cyan('\n🎯 KEY FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Flexible File Handling:')} Works with files, directories, or all changes`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('No Quotes Required:')} File names can be passed with or without quotes`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Detection:')} Automatically detects if files exist before adding`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Repository validation and error handling`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Progress Display:')} Step-by-step execution with colored output`);
  
  console.log(chalk.cyan('\n💡 EXAMPLES:'));
  console.log(`   ${chalk.green('gflow "Initial commit"')}                   ${chalk.gray('# Add all changes')}`);
  console.log(`   ${chalk.green('gflow "Fix login bug" src/auth.js')}        ${chalk.gray('# Add specific file')}`);
  console.log(`   ${chalk.green('gflow "Update docs" README.md docs/')}      ${chalk.gray('# Add file and directory')}`);
  console.log(`   ${chalk.green('gflow "New feature" src/ tests/ README.md')} ${chalk.gray('# Multiple items')}`);
  
  console.log(chalk.cyan('\n🔄 WORKFLOW STEPS:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.white('Validate Repository')} - Ensure we\'re in a Git repo`);
  console.log(`   ${chalk.blue('2.')} ${chalk.white('Add Files/Changes')} - Add specified files or all changes`);
  console.log(`   ${chalk.blue('3.')} ${chalk.white('Commit Changes')} - Create commit with your message`);
  console.log(`   ${chalk.blue('4.')} ${chalk.white('Push to Remote')} - Upload changes to GitHub/remote`);
  
  console.log(chalk.cyan('\n⚠️  NOTES:'));
  console.log(`   ${chalk.yellow('•')} Commit message is required (first argument)`);
  console.log(`   ${chalk.yellow('•')} If no files specified, adds all changes (git add .)`);
  console.log(`   ${chalk.yellow('•')} File paths are validated before adding`);
  console.log(`   ${chalk.yellow('•')} Process stops on any error for safety`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Main workflow function
async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    showHelp();
    return;
  }

  // Validate repository
  if (!validateRepository()) {
    process.exit(1);
  }

  // Extract commit message (first argument)
  const commitMessage = args[0];
  const filesToAdd = args.slice(1); // Remaining arguments are files

  // Validate commit message
  if (!commitMessage || commitMessage.trim().length < 3) {
    console.log(chalk.red('❌ Error: Commit message is required and must be at least 3 characters'));
    console.log(chalk.yellow('💡 Usage: gflow "your commit message" [files...]'));
    console.log(chalk.gray('💡 Or run: gflow --help for more information'));
    process.exit(1);
  }

  console.log(chalk.bold.magenta('\n⚡ Starting Complete Git Workflow...'));
  console.log(chalk.gray('══════════════════════════════════════════════════'));
  console.log(chalk.blue('📝 Commit message:'), chalk.white(`"${commitMessage}"`));
  
  if (filesToAdd.length > 0) {
    console.log(chalk.blue('📁 Files to add:'), chalk.white(filesToAdd.join(', ')));
  } else {
    console.log(chalk.blue('📁 Adding:'), chalk.white('All changes (git add .)'));
  }

  try {
    // Step 1: Add files or all changes
    console.log(chalk.cyan.bold('\n📁 Step 1: Adding changes...'));
    
    if (filesToAdd.length > 0) {
      // Validate that files exist before adding
      const nonExistentFiles = [];
      for (const file of filesToAdd) {
        if (!fs.existsSync(file)) {
          nonExistentFiles.push(file);
        }
      }
      
      if (nonExistentFiles.length > 0) {
        console.log(chalk.yellow(`⚠️  Warning: These files don't exist: ${nonExistentFiles.join(', ')}`));
        console.log(chalk.yellow('   Continuing with existing files only...'));
      }
      
      // Add existing files
      const existingFiles = filesToAdd.filter(file => fs.existsSync(file));
      if (existingFiles.length > 0) {
        const addCommand = `git add ${existingFiles.join(' ')}`;
        const result = runGitCommand(addCommand, `Adding ${existingFiles.length} file(s)`);
        if (!result.success) {
          throw new Error(`Failed to add files: ${result.error}`);
        }
      } else {
        console.log(chalk.red('❌ No valid files to add'));
        process.exit(1);
      }
    } else {
      // Add all changes
      const result = runGitCommand('git add .', 'Adding all changes');
      if (!result.success) {
        throw new Error(`Failed to add changes: ${result.error}`);
      }
    }
    console.log(chalk.green('✅ Changes added to staging area'));

    // Step 2: Commit changes
    console.log(chalk.cyan.bold('\n💾 Step 2: Committing changes...'));
    const commitResult = runGitCommand(`git commit -m "${commitMessage}"`, 'Creating commit', true);
    if (!commitResult.success) {
      throw new Error(`Failed to commit: ${commitResult.error}`);
    }
    console.log(chalk.green('✅ Changes committed successfully'));

    // Step 3: Push to remote
    console.log(chalk.cyan.bold('\n🚀 Step 3: Pushing to remote repository...'));
    const pushResult = runGitCommand('git push', 'Pushing to remote', true);
    if (!pushResult.success) {
      throw new Error(`Failed to push: ${pushResult.error}`);
    }
    console.log(chalk.green('✅ Changes pushed to remote'));

    // Success message
    console.log(chalk.green.bold('\n🎉 Complete workflow finished successfully!'));
    console.log(chalk.blue('💡 Your changes are now live on the remote repository'));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Workflow failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    console.log(chalk.yellow('\n💡 You may need to resolve the issue and try again'));
    console.log(chalk.gray('   Check git status and resolve any conflicts'));
    process.exit(1);
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Unexpected error:'), error.message);
    process.exit(1);
  });
}