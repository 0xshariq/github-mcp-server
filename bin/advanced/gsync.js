#!/usr/bin/env node

/**
 * gsync - Enhanced Sync Workflow
 * 
 * Usage:
 *   gsync                   Pull changes and show status
 *   gsync --help, -h        Show help
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from './common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gsync', 'Enhanced Sync Workflow', [
      'gsync                   Pull changes and show status',
      'gsync --help, -h        Show help'
    ], [
      'gsync                   # Pull latest changes and check status',
      'cd project && gsync     # Sync specific project with remote'
    ], [
      '• Repository validation',
      '• Automatic pull from remote',
      '• Status display after sync',
      '• Perfect for starting work sessions'
    ], '🔄');
    return;
  }

  // Validate repository
  if (!validateRepository('sync workflow')) {
    process.exit(1);
  }

  console.log(chalk.blue.bold('🔄 Starting Repository Sync...'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log();

  try {
    // Step 1: Pull from remote
    console.log(chalk.cyan.bold('⬇️ Step 1: Pulling latest changes from remote...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gpull']);
    console.log(chalk.green('✅ Successfully pulled from remote'));
    console.log();

    // Step 2: Show current status
    console.log(chalk.cyan.bold('📊 Step 2: Checking repository status...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gstatus']);
    console.log();

    console.log(chalk.green.bold('🎉 Repository sync completed successfully!'));
    console.log(chalk.cyan('💡 Your local repository is now up to date'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Sync failed:'), error.message);
    console.log(chalk.yellow('💡 Check your network connection and remote repository access'));
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