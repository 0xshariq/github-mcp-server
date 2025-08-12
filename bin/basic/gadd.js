#!/usr/bin/env node

/**
 * gadd - Enhanced Git Add Alias
 * 
 * Usage:
 *   gadd                    - Add all modified files (smart mode)
 *   gadd file1 file2...     - Add specific files
 *   gadd --help, -h         - Show this help
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gadd', 'Enhanced Git Add', [
      'gadd                    Add all modified files (smart mode)',
      'gadd file1 file2...     Add specific files',
      'gadd --help, -h         Show this help'
    ], [
      'gadd                    # Add all changes',
      'gadd src/file.js        # Add specific file',
      'gadd *.js               # Add all JS files'
    ], [
      '• Repository context validation',
      '• Smart file detection',
      '• Selective file adding'
    ], '📝');
    return;
  }

  // Validate repository
  if (!validateRepository('add')) {
    process.exit(1);
  }

  // Handle different operations
  if (args.length === 0) {
    console.log(chalk.blue.bold('📝 Adding all changes...'));
  } else {
    const files = args.filter(arg => !arg.startsWith('-'));
    if (files.length > 0) {
      console.log(chalk.blue.bold(`📝 Adding files: ${files.join(', ')}`));
    } else {
      console.error(chalk.red.bold('❌ No files specified'));
      console.log(chalk.yellow('💡 Run: gadd --help for usage information'));
      process.exit(1);
    }
  }

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');
  
  // Map to MCP commands
  let mcpCommand, mcpArgs;
  if (args.length === 0) {
    mcpCommand = 'git-add-all';
    mcpArgs = [];
  } else {
    mcpCommand = 'git-add';
    mcpArgs = args;
  }

  const mcpProcess = spawn('node', [mcpCliPath, mcpCommand, ...mcpArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Files added successfully!'));
      console.log(chalk.cyan('💡 Tip: Use "gcommit" to commit your changes'));
    } else {
      console.error(chalk.red.bold(`❌ Add operation failed (code: ${code})`));
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
