#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';

function greset() {
  const args = process.argv.slice(2);
  
  // Handle help command
  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.magenta.bold('\n↩️  greset - Reset Repository State\n'));
    console.log(chalk.cyan('Purpose:'), 'Reset current branch head to specified state, undoing commits or staging changes with precision control.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('greset [options] [commit]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[commit]') + '  - Target commit hash, tag, or reference (default: HEAD)\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('--soft') + '                 - Reset HEAD only, keep index and working tree');
    console.log('  ' + chalk.green('--mixed') + '                - Reset HEAD and index, keep working tree (default)');
    console.log('  ' + chalk.green('--hard') + '                 - Reset HEAD, index, and working tree');
    console.log('  ' + chalk.green('--merge') + '                - Reset but keep local changes in working tree');
    console.log('  ' + chalk.green('--keep') + '                 - Reset but abort if changes would be lost');
    console.log('  ' + chalk.green('-q, --quiet') + '            - Operate quietly, suppress output');
    console.log('  ' + chalk.green('--') + '                     - Separate options from file paths');
    console.log('  ' + chalk.green('-h, --help') + '             - Show detailed help information\n');
    
    console.log(chalk.cyan('File-Specific Reset:'));
    console.log('  ' + chalk.green('-- <file>...') + '           - Reset specific files to HEAD state');
    console.log('  ' + chalk.green('-- <pathspec>...') + '       - Reset files matching pattern\n');
    
    console.log(chalk.cyan('Advanced Options:'));
    console.log('  ' + chalk.green('--recurse-submodules') + '    - Also reset submodules');
    console.log('  ' + chalk.green('--no-recurse-submodules') + ' - Don\'t reset submodules');
    console.log('  ' + chalk.green('--pathspec-from-file=<f>') + '- Read pathspec from file');
    console.log('  ' + chalk.green('--pathspec-file-nul') + '     - Pathspec file is NUL separated\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  greset') + '                     # Unstage all staged changes');
    console.log(chalk.white('  greset --soft HEAD~1') + '       # Undo last commit, keep changes staged');
    console.log(chalk.white('  greset --mixed HEAD~1') + '      # Undo last commit, unstage changes');
    console.log(chalk.white('  greset --hard HEAD~3') + '       # Undo last 3 commits completely');
    console.log(chalk.white('  greset -- file.txt') + '         # Reset specific file to HEAD');
    console.log(chalk.white('  greset --hard origin/main') + '  # Reset to match remote branch');
    console.log(chalk.white('  greset --merge') + '             # Reset but preserve local changes\n');
    
    console.log(chalk.cyan('💡 Reset Types Explained:'));
    console.log('  ' + chalk.yellow('--soft') + '   - Only move HEAD pointer (commits become unstaged)');
    console.log('  ' + chalk.yellow('--mixed') + '  - Move HEAD and reset index (commits become untracked)');
    console.log('  ' + chalk.yellow('--hard') + '   - Reset everything (⚠️  destroys uncommitted work)');
    console.log('  ' + chalk.yellow('--merge') + '  - Smart reset that preserves uncommitted changes');
    console.log('  ' + chalk.yellow('--keep') + '   - Safe reset that aborts if data would be lost\n');
    
    console.log(chalk.cyan('⚠️  Safety Warnings:'));
    console.log('  • ' + chalk.red('--hard') + ' permanently deletes uncommitted changes');
    console.log('  • Always check ' + chalk.yellow('git status') + ' before hard reset');
    console.log('  • Consider ' + chalk.yellow('git stash') + ' to save work before reset');
    console.log('  • Use ' + chalk.yellow('--soft') + ' or ' + chalk.yellow('--mixed') + ' for safer operations');
    console.log('  • ' + chalk.yellow('git reflog') + ' can help recover lost commits');
    console.log('\n' + chalk.gray('═'.repeat(60)));
    process.exit(0);
  }

  try {
    // Build command
    let command = 'git reset';
    
    // Parse arguments to detect mode and files
    const hasFiles = args.includes('--');
    const fileIndex = args.indexOf('--');
    const beforeFiles = fileIndex !== -1 ? args.slice(0, fileIndex) : args;
    const files = fileIndex !== -1 ? args.slice(fileIndex + 1) : [];
    
    // Add parsed arguments (excluding -h/--help)
    const validArgs = beforeFiles.filter(arg => !['--help', '-h'].includes(arg));
    if (validArgs.length > 0) {
      command += ` ${validArgs.join(' ')}`;
    }
    
    // Add file separator and files if present
    if (hasFiles) {
      command += ' --';
      if (files.length > 0) {
        command += ` ${files.join(' ')}`;
      }
    }

    // Show what we're about to do
    console.log(chalk.blue('🔄 Executing:'), chalk.white(command));
    
    // Execute the git command
    const output = execSync(command, { 
      cwd: process.cwd(), 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Show success message with output
    if (output.trim()) {
      console.log(chalk.green('✅ Reset completed:'));
      console.log(output.trim());
    } else {
      console.log(chalk.green('✅ Reset completed successfully'));
    }
    
    // Show current status after reset for context
    try {
      const statusOutput = execSync('git status --porcelain', { 
        cwd: process.cwd(), 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (statusOutput.trim()) {
        console.log(chalk.yellow('\n📋 Repository status after reset:'));
        const status = execSync('git status -s', { 
          cwd: process.cwd(), 
          encoding: 'utf8' 
        });
        console.log(status.trim());
      } else {
        console.log(chalk.green('\n✨ Working tree is clean after reset'));
      }
    } catch (statusError) {
      // Status check failed, but reset succeeded
    }

  } catch (error) {
    console.error(chalk.red('❌ Reset failed:'), error.message.trim());
    
    // Provide helpful error context
    if (error.message.includes('not a git repository')) {
      console.log(chalk.yellow('💡 Make sure you\'re in a Git repository directory'));
    } else if (error.message.includes('ambiguous argument')) {
      console.log(chalk.yellow('💡 The specified commit reference doesn\'t exist'));
      console.log(chalk.yellow('   Use: git log --oneline to see available commits'));
    } else if (error.message.includes('pathspec') && error.message.includes('did not match')) {
      console.log(chalk.yellow('💡 The specified file path doesn\'t exist'));
      console.log(chalk.yellow('   Use: git ls-files to see tracked files'));
    } else if (error.message.includes('fatal: Could not reset index file')) {
      console.log(chalk.yellow('💡 Index is corrupted or locked'));
      console.log(chalk.yellow('   Try: rm .git/index.lock'));
    }
    
    process.exit(1);
  }
}

greset();

