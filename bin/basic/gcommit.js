#!/usr/bin/env node

/**
 * gcommit - Enhanced Git Commit Alias
 * 
 * Usage:
 *   gcommit "commit message"    - Commit with message
 *   gcommit --help, -h          - Show this help
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gcommit', 'Enhanced Git Commit', [
      'gcommit "commit message"    Commit with message',
      'gcommit --help, -h          Show this help'
    ], [
      'gcommit "Add new feature"   # Commit with descriptive message',
      'gcommit "Fix bug in auth"   # Commit bug fix',
      'gcommit "Update docs"       # Quick documentation update'
    ], [
      '• Repository context validation',
      '• Enhanced error handling',
      '• Commit message validation'
    ], '🚀');
    return;
  }

  // Validate repository
  if (!validateRepository('commit')) {
    process.exit(1);
  }

  // Check if commit message is provided
  if (args.length === 0) {
    console.error(chalk.red.bold('❌ Commit message required'));
    console.log(chalk.yellow('💡 Usage: gcommit "your commit message"'));
    console.log(chalk.gray('💡 Run: gcommit --help for more information'));
    process.exit(1);
  }

  const commitMessage = args.join(' ');
  
  console.log(chalk.blue.bold('🚀 Committing changes...'));
  console.log(chalk.gray(`📝 Message: "${commitMessage}"`));

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');

  const mcpProcess = spawn('node', [mcpCliPath, 'git-commit', commitMessage], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Commit successful!'));
      console.log(chalk.cyan('💡 Tip: Use "gpush" to push your changes'));
    } else {
      console.error(chalk.red.bold(`❌ Commit failed (code: ${code})`));
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
