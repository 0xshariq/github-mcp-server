#!/usr/bin/env node

/**
 * gadd - Enhanced Git Add with Smart File Handling
 * 
 * Features:
 * - Smart file detection and validation
 * - Supports patterns and multiple files
 * - Beautiful progress display
 * - Repository validation
 * - File existence checking
 * 
 * Usage:
 *   gadd                    - Add all modified files
 *   gadd file1.js file2.css - Add specific files  
 *   gadd src/               - Add entire directory
 *   gadd *.js               - Add files matching pattern
 *   gadd --help             - Show help
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
function runGitCommand(command, description) {
  try {
    console.log(chalk.cyan(`🔧 ${description}...`));
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
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
  console.log(chalk.bold.green(`
📝 gadd - Enhanced Git Add with Smart Handling
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gadd')}                      ${chalk.gray('# Add all modified and new files')}`);
  console.log(`   ${chalk.green('gadd file1.js file2.css')}   ${chalk.gray('# Add specific files')}`);
  console.log(`   ${chalk.green('gadd src/ docs/')}           ${chalk.gray('# Add entire directories')}`);
  console.log(`   ${chalk.green('gadd *.js')}                ${chalk.gray('# Add files matching pattern')}`);
  console.log(`   ${chalk.green('gadd --all')}               ${chalk.gray('# Add all files (including deleted)')}`);
  console.log(`   ${chalk.green('gadd --help')}              ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Detection:')} Automatically validates files before adding`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Pattern Support:')} Supports wildcards and glob patterns`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Directory Support:')} Can add entire directories recursively`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safety Checks:')} Warns about non-existent files`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Progress Display:')} Shows detailed operation progress`);
  
  console.log(chalk.cyan('\n� EXAMPLES:'));
  console.log(`   ${chalk.green('gadd')}                      ${chalk.gray('# Add all changes in repository')}`);
  console.log(`   ${chalk.green('gadd package.json')}         ${chalk.gray('# Add specific configuration file')}`);
  console.log(`   ${chalk.green('gadd src/ README.md')}       ${chalk.gray('# Add directory and file')}`);
  console.log(`   ${chalk.green('gadd *.js *.css')}           ${chalk.gray('# Add all JS and CSS files')}`);
  console.log(`   ${chalk.green('gadd --all')}               ${chalk.gray('# Add everything including deletions')}`);
  
  console.log(chalk.cyan('\n⚡ QUICK WORKFLOW:'));
  console.log(`   ${chalk.blue('1.')} Run ${chalk.green('gstatus')} to see what files have changed`);
  console.log(`   ${chalk.blue('2.')} Use ${chalk.green('gadd')} to stage the files you want`);
  console.log(`   ${chalk.blue('3.')} Run ${chalk.green('gcommit "message"')} to commit changes`);
  console.log(`   ${chalk.blue('4.')} Use ${chalk.green('gpush')} to upload to remote`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Check file existence (for non-pattern arguments)
function checkFileExists(filePath) {
  // Don't check patterns that contain wildcards
  if (filePath.includes('*') || filePath.includes('?')) {
    return true; // Let git handle pattern matching
  }
  
  try {
    return fs.existsSync(filePath) || fs.statSync(filePath).isDirectory();
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
  
  try {
    let command;
    let description;
    
    if (args.length === 0) {
      // Add all changes
      command = 'git add .';
      description = 'Adding all modified and new files';
      console.log(chalk.bold.cyan('\n📝 Smart Add: All Changes'));
      console.log(chalk.gray('─'.repeat(40)));
      
    } else if (args.includes('--all')) {
      // Add everything including deletions
      command = 'git add -A';
      description = 'Adding all changes including deletions';
      console.log(chalk.bold.cyan('\n📝 Add All: Including Deletions'));
      console.log(chalk.gray('─'.repeat(40)));
      
    } else {
      // Add specific files
      const files = args.filter(arg => !arg.startsWith('-'));
      
      if (files.length === 0) {
        console.log(chalk.red('❌ No files specified'));
        console.log(chalk.yellow('💡 Usage: gadd [files...] or gadd --help'));
        process.exit(1);
      }
      
      // Check file existence (skip for patterns)
      const nonExistentFiles = files.filter(file => !checkFileExists(file));
      
      if (nonExistentFiles.length > 0) {
        console.log(chalk.yellow('⚠️  Warning: These files/patterns may not exist:'));
        nonExistentFiles.forEach(file => {
          console.log(chalk.gray(`   • ${file}`));
        });
        console.log(chalk.blue('   Continuing with git add (patterns will be resolved by git)...\n'));
      }
      
      command = `git add ${files.join(' ')}`;
      description = `Adding ${files.length} file(s)`;
      console.log(chalk.bold.cyan('\n📝 Add Specific Files'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('Files:'), chalk.white(files.join(', ')));
    }
    
    // Execute the git add command
    const result = runGitCommand(command, description);
    
    if (result.success) {
      console.log(chalk.green.bold('\n✅ Files successfully staged!'));
      console.log(chalk.blue('💡 Next steps:'));
      console.log(chalk.gray(`   • ${chalk.green('gstatus')} - Check what was added`));
      console.log(chalk.gray(`   • ${chalk.green('gcommit "message"')} - Commit the changes`));
      console.log(chalk.gray(`   • ${chalk.green('gflow "message"')} - Complete workflow (commit + push)`));
    } else {
      console.log(chalk.red.bold('\n❌ Failed to add files!'));
      console.log(chalk.yellow('💡 Check the error above and fix any issues'));
      process.exit(1);
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Unexpected error:'), error.message);
    console.log(chalk.yellow('💡 Make sure you\'re in a valid git repository'));
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
