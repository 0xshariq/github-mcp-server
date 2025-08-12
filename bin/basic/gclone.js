#!/usr/bin/env node

/**
 * gclone - Enhanced Git Clone Alias
 * 
 * Usage:
 *   gclone <url> [directory]        Clone repository
 *   gclone --help, -h               Show help
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { showHelp, validateRepository } from '../advanced/common.js';

async function main() {
  // Get command line arguments (excluding node and script name)
  const args = process.argv.slice(2);

  // Check for help flags
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gclone', 'Enhanced Git Clone', [
      'gclone <repository-url>              Clone repository to current directory',
      'gclone <repository-url> <directory>  Clone repository to specific directory',
      'gclone --help, -h                    Show this help'
    ], [
      'gclone https://github.com/user/repo.git',
      'gclone https://github.com/user/repo.git my-project',
      'gclone git@github.com:user/repo.git'
    ], [
      '• Downloads the complete repository from remote',
      '• Sets up local working directory',
      '• Configures remote origin automatically'
    ], '📥');
    return;
  }

  // Validate arguments
  if (args.length === 0) {
    console.error(chalk.red.bold('❌ Error: Repository URL is required'));
    console.log(chalk.yellow('💡 Usage: gclone <repository-url> [directory]'));
    console.log(chalk.yellow('💡 Run: gclone --help for more information'));
    process.exit(1);
  }

  console.log(chalk.blue.bold('🎯 Cloning repository...'));

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-clone', ...args], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Repository cloned successfully!'));
    } else {
      console.error(chalk.red.bold(`❌ Clone failed with code: ${code}`));
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