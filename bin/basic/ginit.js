#!/usr/bin/env node

/**
 * ginit - Enhanced Git Initialize Alias
 * 
 * Usage:
 *   ginit                   - Initialize new Git repository
 *   ginit --help, -h        - Show this help
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { showHelp } from '../advanced/common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('ginit', 'Enhanced Git Initialize', [
      'ginit                   Initialize new Git repository',
      'ginit --help, -h        Show this help'
    ], [
      'ginit                   # Initialize Git repository in current directory',
      'cd my-project && ginit  # Initialize in project directory'
    ], [
      '• Creates .git directory',
      '• Sets up initial repository structure',
      '• Ready for first commit'
    ], '🎯');
    return;
  }

  // Check if already a git repository
  if (fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log(chalk.yellow.bold('⚠️  Git repository already exists'));
    console.log(chalk.gray('Current directory is already a Git repository'));
    return;
  }

  console.log(chalk.blue.bold('🎯 Initializing Git repository...'));
  console.log(chalk.gray(`📁 Location: ${process.cwd()}`));

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-init'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Git repository initialized!'));
      console.log(chalk.cyan('💡 Next steps:'));
      console.log(chalk.gray('   • Add files: gadd .'));
      console.log(chalk.gray('   • First commit: gcommit "Initial commit"'));
    } else {
      console.error(chalk.red.bold(`❌ Repository initialization failed (code: ${code})`));
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
