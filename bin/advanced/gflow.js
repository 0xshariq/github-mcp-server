#!/usr/bin/env node

/**
 * gflow - Enhanced Complete Git Workflow
 * 
 * Complete git workflow: add → commit → push
 * 
 * Usage:
 *   gflow "commit message"                         - Add ALL changes, commit, push
 *   gflow "commit message" file1.js file2.js      - Add SPECIFIC files, commit, push  
 *   gflow "commit message" src/ docs/             - Add SPECIFIC folders, commit, push
 *   gflow "commit message" file.js src/ README.md - Add MIX of files and folders
 *   gflow --help                                  - Show this help
 * 
 * Logic:
 * - First argument: commit message (required, must be quoted)
 * - Remaining arguments: files/folders to add (optional)
 * - If no files specified: adds all changes (git add .)
 * - Always commits and pushes after adding
 * 
 * Features:
 * - Smart file validation (checks if files exist)
 * - Repository safety checks
 * - Detailed progress display with colors
 * - Error handling and recovery suggestions
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
  console.log(chalk.cyan('📋 SYNTAX:'));
  console.log(`   ${chalk.green('gflow "commit message" [files/folders...]')}`);
  console.log('');
  console.log(chalk.cyan('📖 LOGIC:'));
  console.log(`   ${chalk.blue('1.')} First argument = commit message (required, quoted)`);
  console.log(`   ${chalk.blue('2.')} Remaining arguments = files/folders to add (optional)`);
  console.log(`   ${chalk.blue('3.')} If no files given → adds ALL changes (git add .)`);
  console.log(`   ${chalk.blue('4.')} Always commits and pushes after adding`);
  
  console.log(chalk.cyan('\n💡 EXAMPLES:'));
  console.log(`   ${chalk.green('gflow "Initial commit"')}                   ${chalk.gray('→ Add ALL changes')}`);
  console.log(`   ${chalk.green('gflow "Fix bug" src/auth.js')}              ${chalk.gray('→ Add ONLY src/auth.js')}`);
  console.log(`   ${chalk.green('gflow "Update docs" README.md docs/')}      ${chalk.gray('→ Add README.md + docs/ folder')}`);
  console.log(`   ${chalk.green('gflow "Release" src/ tests/ package.json')} ${chalk.gray('→ Add multiple items')}`);
  
  console.log(chalk.cyan('\n🔄 WORKFLOW:'));
  console.log(`   ${chalk.blue('①')} Validate git repository`);
  console.log(`   ${chalk.blue('②')} Add files (specific files OR all changes)`);
  console.log(`   ${chalk.blue('③')} Commit with message`);
  console.log(`   ${chalk.blue('④')} Push to remote`);
  
  console.log(chalk.cyan('\n⚠️  IMPORTANT:'));
  console.log(`   ${chalk.yellow('•')} Commit message MUST be quoted`);
  console.log(`   ${chalk.yellow('•')} Files/folders are validated before adding`);
  console.log(`   ${chalk.yellow('•')} Process stops on any error for safety`);
  console.log(`   ${chalk.yellow('•')} No files specified = add everything`);
  
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

  // Extract commit message (first argument) and files (remaining arguments)
  const commitMessage = args[0];
  const filesToAdd = args.slice(1); // Remaining arguments are files/folders

  // Validate commit message
  if (!commitMessage || commitMessage.trim().length < 3) {
    console.log(chalk.red('❌ Error: Commit message is required and must be at least 3 characters'));
    console.log(chalk.yellow('💡 Usage: gflow "your commit message" [files/folders...]'));
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