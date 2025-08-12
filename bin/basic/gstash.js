#!/usr/bin/env node

/**
 * gstash - Enhanced Git Stash Alias
 * 
 * Usage:
 *   gstash                - Stash current changes
 *   gstash "message"      - Stash with custom message
 *   gstash --list         - List all stashes
 *   gstash -h, --help     - Show help
 * 
 * Features:
 * - Repository context validation
 * - Custom stash messages
 * - Stash management
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
    showHelp('gstash', 'Enhanced Git Stash Management', [
      'gstash                Stash current changes',
      'gstash "message"      Stash with custom message',
      'gstash --list         List all stashes',
      'gstash -h, --help     Show this help'
    ], [
      'gstash                # Stash current changes',
      'gstash "WIP: feature" # Stash with message',
      'gstash --list         # List all stashes'
    ], [
      '• Repository context validation',
      '• Custom stash messages',
      '• Stash management'
    ], '💾');
    return;
  }

  // List stashes if requested
  if (args.includes('--list')) {
    console.log(chalk.blue.bold('💾 Listing all stashes...'));
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
  if (!validateRepository('stash')) {
    process.exit(1);
  }

  // Determine stash message
  const message = args.join(' ').trim();
  if (message) {
    console.log(chalk.blue.bold(`💾 Stashing changes with message: "${message}"`));
  } else {
    console.log(chalk.blue.bold('💾 Stashing current changes...'));
  }

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');
  const mcpArgs = message ? ['git-stash', message] : ['git-stash'];

  const mcpProcess = spawn('node', [mcpCliPath, ...mcpArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Changes stashed successfully!'));
      console.log(chalk.cyan('💡 Tip: Use "gpop" to restore stashed changes later'));
    } else {
      console.error(chalk.red.bold(`❌ Stash failed (code: ${code})`));
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
