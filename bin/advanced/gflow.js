#!/usr/bin/env node

/**
 * gflow - Enhanced Complete Git Workflow
 * 
 * Usage:
 *   gflow "commit message"       - Complete workflow (add → commit → push)
 *   gflow -h, --help            - Show help
 *   gflow --status              - Show status before workflow
 *   gflow --dry-run "message"    - Preview what will be done
 * 
 * Features:
 * - Repository validation
 * - Safety checks
 * - Step-by-step progress
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from './common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gflow', 'Enhanced Complete Git Workflow', [
      'gflow "commit message"       Complete workflow (add → commit → push)',
      'gflow --status              Show status before workflow',
      'gflow --dry-run "message"    Preview what will be done',
      'gflow -h, --help            Show help'
    ], [
      'gflow "Fix authentication bug"  # Complete workflow with message',
      'gflow "Add new feature"         # Another workflow example',
      'gflow --status                 # Check status first',
      'gflow --dry-run "test msg"     # Preview without changes'
    ], [
      '• Repository validation',
      '• Safety checks and confirmations',
      '• Step-by-step progress display',
      '• Automatic add → commit → push sequence'
    ], '⚡');
    return;
  }

  // Validate repository
  if (!validateRepository('complete workflow')) {
    process.exit(1);
  }

  // Show status first if requested
  if (args.includes('--status')) {
    console.log(chalk.blue.bold('📊 Repository Status Before Workflow:'));
    const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');
    
    const statusProcess = spawn('node', [mcpCliPath, 'gstatus'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    statusProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.cyan.bold('\n💡 Use: gflow "message" to run complete workflow'));
      }
      process.exit(code);
    });
    return;
  }

  // Validate commit message
  if (args.length === 0 || (!args.includes('--dry-run') && args.join(' ').trim().length < 3)) {
    console.error(chalk.red.bold('❌ Error: Commit message is required and must be at least 3 characters'));
    console.log(chalk.yellow('💡 Usage: gflow "your commit message"'));
    console.log(chalk.gray('💡 Or run: gflow --help for more options'));
    process.exit(1);
  }

  const commitMessage = args.includes('--dry-run') 
    ? args.slice(args.indexOf('--dry-run') + 1).join(' ')
    : args.join(' ');

  // Dry run mode
  if (args.includes('--dry-run')) {
    console.log(chalk.yellow.bold('🔍 DRY RUN MODE - No changes will be made'));
    console.log(chalk.dim('═'.repeat(50)));
    console.log(chalk.blue('📍 Working directory:'), chalk.white(process.cwd()));
    console.log(chalk.blue('📝 Commit message:'), chalk.white(`"${commitMessage}"`));
    console.log();
    console.log(chalk.cyan.bold('⚡ This would execute:'));
    console.log(chalk.gray('  1. 📁 Add all modified files (gadd .)'));
    console.log(chalk.gray('  2. 💾 Commit with message:'), chalk.white(`"${commitMessage}"`));
    console.log(chalk.gray('  3. 🚀 Push to remote repository (gpush)'));
    console.log();
    console.log(chalk.green('💡 Remove --dry-run to execute the workflow'));
    return;
  }

  console.log(chalk.blue.bold('⚡ Starting Complete Git Workflow...'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log(chalk.blue('📍 Working directory:'), chalk.white(process.cwd()));
  console.log(chalk.blue('📝 Commit message:'), chalk.white(`"${commitMessage}"`));
  console.log();

  try {
    // Step 1: Add all changes
    console.log(chalk.cyan.bold('📁 Step 1: Adding all changes...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gadd']);
    console.log(chalk.green('✅ Files added successfully'));
    console.log();

    // Step 2: Commit changes
    console.log(chalk.cyan.bold('💾 Step 2: Committing changes...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gcommit', commitMessage]);
    console.log(chalk.green('✅ Changes committed successfully'));
    console.log();

    // Step 3: Push to remote
    console.log(chalk.cyan.bold('🚀 Step 3: Pushing to remote...'));
    await runCommand('node', [path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js'), 'gpush']);
    console.log(chalk.green('✅ Changes pushed successfully'));
    console.log();

    console.log(chalk.green.bold('🎉 Complete Git workflow finished successfully!'));
    console.log(chalk.cyan('💡 Your changes are now live on the remote repository'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Workflow failed:'), error.message);
    console.log(chalk.yellow('💡 Check the errors above and resolve any issues'));
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