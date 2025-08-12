#!/usr/bin/env node

/**
 * gquick - Quick Commit Workflow
 * 
 * Usage:
 *   gquick [commit-message]
 *   gquick --help, -h
 * 
 * This combines: add all → commit
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from './common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gquick', 'Quick Commit Workflow', [
      'gquick "commit message"     Add all files and commit with message',
      'gquick                      Add all files and commit with "Auto commit"',
      'gquick --help, -h           Show this help'
    ], [
      'gquick "Fix navigation bug"   # Add all and commit with message',
      'gquick "Update documentation" # Another quick commit',
      'gquick                       # Auto commit with default message'
    ], [
      '• Combines add and commit operations',
      '• Repository validation',
      '• Automatic file detection',
      '• Quick workflow for small changes'
    ], '⚡');
    return;
  }

  // Validate repository
  if (!validateRepository('quick commit')) {
    process.exit(1);
  }

  // Get commit message or use default
  const commitMessage = args.length > 0 ? args.join(' ') : 'Auto commit';

  console.log(chalk.blue.bold('⚡ Starting Quick Commit Workflow...'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log(chalk.blue('📝 Commit message:'), chalk.white(`"${commitMessage}"`));
  console.log();

  try {
    // Step 1: Add all changes
    console.log(chalk.cyan.bold('📁 Step 1: Adding all changes...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gadd']);
    console.log(chalk.green('✅ All changes added to staging area'));
    console.log();

    // Step 2: Commit changes
    console.log(chalk.cyan.bold('💾 Step 2: Committing changes...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gcommit', commitMessage]);
    console.log(chalk.green('✅ Changes committed successfully'));
    console.log();

    console.log(chalk.green.bold('🎉 Quick commit workflow completed!'));
    console.log(chalk.cyan('💡 Your changes are staged and committed'));
    console.log(chalk.gray('💡 Use "gpush" to push to remote repository'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Quick commit failed:'), error.message);
    process.exit(1);
  }
}

// Helper function to run commands
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

// ESM module detection
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red.bold('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}