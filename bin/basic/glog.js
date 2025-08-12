#!/usr/bin/env node

/**
 * glog - Enhanced Git Log Alias
 * 
 * Usage:
 *   glog                 - Show recent commits (default 10)
 *   glog 20              - Show specific number of commits
 *   glog -h, --help      - Show help
 *   glog --oneline       - Compact one-line format
 * 
 * Features:
 * - Repository context validation
 * - Configurable commit count
 * - Compact display options
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
    showHelp('glog', 'Enhanced Git Commit History', [
      'glog                 Show recent commits (default 10)',
      'glog 20              Show specific number of commits',
      'glog --oneline       Compact one-line format',
      'glog -h, --help      Show this help'
    ], [
      'glog                 # Show last 10 commits',
      'glog 5               # Show last 5 commits',
      'glog --oneline       # Compact format'
    ], [
      '• Repository context validation',
      '• Configurable commit count',
      '• Compact display options'
    ], '📜');
    return;
  }
  // Validate repository
  if (!validateRepository('log')) {
    process.exit(1);
  }

  // Parse commit count
  let commitCount = 10; // default
  const numArg = args.find(arg => /^\d+$/.test(arg));
  if (numArg) {
    commitCount = parseInt(numArg);
    if (commitCount > 100) {
      console.log(chalk.yellow.bold('⚠️  Limiting to 100 commits for performance'));
      commitCount = 100;
    }
  }

  console.log(chalk.blue.bold(`📝 Showing last ${commitCount} commits...`));

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-log', commitCount.toString()], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.cyan('\n💡 Tip: Use "gdiff" to see changes in commits'));
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
