#!/usr/bin/env node

/**
 * gdiff - Enhanced Git Diff Alias
 * 
 * Usage:
 *   gdiff                 - Show unstaged changes
 *   gdiff --cached        - Show staged changes
 *   gdiff "branch"        - Compare with branch
 *   gdiff -h, --help      - Show help
 * 
 * Features:
 * - Repository context validation
 * - Multiple diff modes
 * - Clear output formatting
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
    showHelp('gdiff', 'Enhanced Git Diff Viewer', [
      'gdiff                 Show unstaged changes',
      'gdiff --cached        Show staged changes', 
      'gdiff "branch"        Compare with branch',
      'gdiff -h, --help      Show this help'
    ], [
      'gdiff                 # Show unstaged changes',
      'gdiff --cached        # Show staged changes',
      'gdiff "main"          # Compare with main branch'
    ], [
      '• Repository context validation',
      '• Multiple diff modes',
      '• Clear output formatting'
    ], '📄');
    return;
  }

  // Validate repository
  if (!validateRepository('diff')) {
    process.exit(1);
  }

  // Determine diff type
  if (args.includes('--cached')) {
    console.log(chalk.blue.bold('📄 Showing staged changes...'));
  } else if (args.length > 0 && !args[0].startsWith('-')) {
    console.log(chalk.blue.bold(`📄 Comparing with: ${args[0]}`));
  } else {
    console.log(chalk.blue.bold('📄 Showing unstaged changes...'));
  }

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-diff', ...args], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.cyan('\n💡 Tip: Use "gstatus" to see current repository state'));
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
