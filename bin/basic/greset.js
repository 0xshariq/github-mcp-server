#!/usr/bin/env node

/**
 * greset - Enhanced Git Reset Alias
 * 
 * Usage:
 *   greset [mode] [target]          Reset repository
 *   greset --help, -h               Show help
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

async function main() {
  // Get command line arguments (excluding node and script name)
  const args = process.argv.slice(2);

  // Check for help flags
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('greset', 'Enhanced Git Reset', [
      'greset                    Reset staging area (keep working directory)',
      'greset --soft             Reset commit pointer only',
      'greset --hard             Reset everything (DANGEROUS)',
      'greset --help, -h         Show this help'
    ], [
      'greset                    # Reset staging area',
      'greset --soft HEAD~1      # Undo last commit (keep changes)',
      'greset --hard HEAD~1      # Undo last commit (lose changes)'
    ], [
      '• Repository context validation',
      '• Safe reset operations',
      '• Multiple reset modes'
    ], '↩️ ');
    return;
  }

  // Validate repository
  if (!validateRepository('reset')) {
    process.exit(1);
  }

  // Warn for dangerous operations
  if (args.includes('--hard')) {
    console.log(chalk.red.bold('⚠️  WARNING: --hard will permanently delete uncommitted changes!'));
    console.log(chalk.blue.bold('🎯 Executing git reset --hard...'));
  } else if (args.includes('--soft')) {
    console.log(chalk.blue.bold('🎯 Executing git reset --soft...'));
  } else {
    console.log(chalk.blue.bold('🎯 Executing git reset...'));
  }

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-reset', ...args], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Reset completed successfully!'));
      console.log(chalk.cyan('💡 Tip: Use "gstatus" to see current repository state'));
    } else {
      console.error(chalk.red.bold(`❌ Reset failed (code: ${code})`));
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

