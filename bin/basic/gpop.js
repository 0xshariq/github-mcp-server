#!/usr/bin/env node

/**
 * gpop - Enhanced Git Stash Pop Alias
 * 
 * Usage:
 *   gpop                  - Apply most recent stash
 *   gpop -h, --help       - Show help
 *   gpop --list           - List stashes first
 * 
 * Features:
 * - Repository context validation
 * - Safe stash application
 * - Stash listing option
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gpop', 'Enhanced Git Stash Pop', [
      'gpop                  Apply most recent stash',
      'gpop --list           List stashes first',
      'gpop -h, --help       Show this help'
    ], [
      'gpop                  # Apply most recent stash',
      'gpop --list           # See available stashes first'
    ], [
      '• Repository context validation',
      '• Safe stash application',
      '• Stash listing option'
    ], '📦');
    return;
  }

  // List stashes if requested
  if (args.includes('--list')) {
    console.log(chalk.blue.bold('💾 Available stashes:'));
    const listProcess = spawn('git', ['stash', 'list'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    listProcess.on('close', (code) => {
      console.log(chalk.cyan('\n💡 Use "gpop" to apply the most recent stash'));
      process.exit(code);
    });
    return;
  }

  // Validate repository
  if (!validateRepository('stash-pop')) {
    process.exit(1);
  }

  console.log(chalk.blue.bold('💾 Applying most recent stash...'));

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-stash-pop'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Stash applied successfully!'));
      console.log(chalk.cyan('💡 Tip: Use "gstatus" to see your current changes'));
    } else {
      console.error(chalk.red.bold(`❌ Failed to apply stash (code: ${code})`));
    }
    process.exit(code);
  });

  mcpProcess.on('error', (err) => {
    console.error(chalk.red.bold('❌ Error:'), err.message);
    process.exit(1);
  });
}

// ESM module detection
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
