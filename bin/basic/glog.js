#!/usr/bin/env node

/**
 * glog - Enhanced Git Log with Beautiful Formatting
 * 
 * Features:
 * - Beautiful commit history display with colors
 * - Multiple formatting options (compact, detailed, graph)
 * - Configurable commit count and filtering
 * - Author and date information styling
 * - Branch and tag visualization
 * 
 * Usage:
 *   glog                    - Show recent commits (default 10)
 *   glog 20                 - Show specific number of commits
 *   glog --oneline          - Compact one-line format
 *   glog --graph            - Show branch graph
 *   glog --author "name"    - Filter by author
 *   glog --help             - Show this help
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
📜 glog - Enhanced Git Log with Beautiful Formatting
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('glog')}                      ${chalk.gray('# Show recent commits (default 10)')}`);
  console.log(`   ${chalk.green('glog 20')}                   ${chalk.gray('# Show specific number of commits')}`);
  console.log(`   ${chalk.green('glog --oneline')}            ${chalk.gray('# Compact one-line format')}`);
  console.log(`   ${chalk.green('glog --graph')}              ${chalk.gray('# Show branch graph visualization')}`);
  console.log(`   ${chalk.green('glog --author "name"')}      ${chalk.gray('# Filter commits by author')}`);
  console.log(`   ${chalk.green('glog --since "1 week ago"')} ${chalk.gray('# Show commits from time period')}`);
  console.log(`   ${chalk.green('glog --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Beautiful Formatting:')} Color-coded commit information`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Multiple Views:')} Oneline, detailed, and graph formats`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Filtering:')} By author, date, or commit count`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Visualization:')} See merge and branch patterns`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Hash Display:')} Short commit hashes for easy reference`);
  
  console.log(chalk.cyan('\n💡 FORMAT EXAMPLES:'));
  console.log(`   ${chalk.blue('Default:')} Shows commit hash, message, author, and date`);
  console.log(`   ${chalk.blue('Oneline:')} Compact format with hash and message only`);
  console.log(`   ${chalk.blue('Graph:')} Visual branch structure with merge relationships`);
  
  console.log(chalk.cyan('\n⚡ COMMON USAGE:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('glog')} - Quick overview of recent work`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('glog --graph')} - Understand branch structure`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('glog --author "me"')} - See your own commits`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('glog 50')} - Review more extensive history`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Parse commit number from arguments
function parseCommitCount(args) {
  for (const arg of args) {
    if (/^\d+$/.test(arg)) {
      return parseInt(arg);
    }
  }
  return 10; // default
}

// Get author filter from arguments
function getAuthorFilter(args) {
  const authorIndex = args.indexOf('--author');
  if (authorIndex !== -1 && authorIndex < args.length - 1) {
    return args[authorIndex + 1];
  }
  return null;
}

// Get since filter from arguments
function getSinceFilter(args) {
  const sinceIndex = args.indexOf('--since');
  if (sinceIndex !== -1 && sinceIndex < args.length - 1) {
    return args[sinceIndex + 1];
  }
  return null;
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
    const commitCount = parseCommitCount(args);
    const authorFilter = getAuthorFilter(args);
    const sinceFilter = getSinceFilter(args);
    const onelineMode = args.includes('--oneline');
    const graphMode = args.includes('--graph');
    
    console.log(chalk.bold.magenta('\n📜 Git Commit History'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Build git log command
    let gitCommand = 'git log';
    
    // Add formatting
    if (onelineMode) {
      gitCommand += ' --oneline --decorate';
    } else if (graphMode) {
      gitCommand += ' --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset"';
    } else {
      gitCommand += ' --pretty=format:"%C(yellow)%h%Creset %C(bold blue)%an%Creset %C(green)%cr%Creset%n    %C(white)%s%Creset%n"';
    }
    
    // Add filters
    if (commitCount) {
      gitCommand += ` -n ${commitCount}`;
    }
    
    if (authorFilter) {
      gitCommand += ` --author="${authorFilter}"`;
    }
    
    if (sinceFilter) {
      gitCommand += ` --since="${sinceFilter}"`;
    }
    
    console.log(chalk.blue('📊 Showing:'), chalk.white(`${commitCount} commits`));
    if (authorFilter) {
      console.log(chalk.blue('👤 Author:'), chalk.white(authorFilter));
    }
    if (sinceFilter) {
      console.log(chalk.blue('📅 Since:'), chalk.white(sinceFilter));
    }
    console.log();
    
    // Execute git log command
    const result = execSync(gitCommand, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log(chalk.blue('\n💡 Useful commands:'));
    console.log(chalk.gray(`   • ${chalk.green('glog --graph')} - See branch visualization`));
    console.log(chalk.gray(`   • ${chalk.green('glog --oneline')} - Compact format`));
    console.log(chalk.gray(`   • ${chalk.green('glog --author "name"')} - Filter by author`));
    console.log(chalk.gray(`   • Use commit hashes with other git commands`));
    
  } catch (error) {
    if (error.message.includes('does not have any commits yet')) {
      console.log(chalk.yellow('📝 Repository has no commits yet'));
      console.log(chalk.blue('💡 Make your first commit with:'));
      console.log(chalk.gray(`   • Create some files`));
      console.log(chalk.gray(`   • ${chalk.green('gadd .')}`));
      console.log(chalk.gray(`   • ${chalk.green('gcommit "Initial commit"')}`));
    } else {
      console.log(chalk.red.bold('\n❌ Failed to get commit history!'));
      console.log(chalk.red(`Error: ${error.message}`));
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
