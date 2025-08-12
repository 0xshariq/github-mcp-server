#!/usr/bin/env node

/**
 * gremote - Enhanced Git Remote Management
 *
 * Usage:
 *   gremote                          - List remote repositories
 *   gremote add <name> <url>         - Add a new remote
 *   gremote remove <name>            - Remove a remote
 *   gremote set-url <url> [name]     - Set URL for a remote (default: origin)
 *   gremote -h, --help               - Show this help message
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gremote', 'Enhanced Git Remote Management', [
      'gremote                          List remote repositories',
      'gremote add <name> <url>         Add a new remote',
      'gremote remove <name>            Remove a remote',
      'gremote set-url <url> [name]     Set URL for a remote (default: origin)',
      'gremote -h, --help               Show this help message'
    ], [
      'gremote                          # List remotes',
      'gremote add upstream https://github.com/owner/repo.git',
      'gremote remove old-remote',
      'gremote set-url https://new.url/repo.git',
      'gremote set-url https://new.url/repo.git upstream'
    ], [
      '• Repository context validation',
      '• Comprehensive remote management', 
      '• Safe remote operations'
    ], '🔗');
    return;
  }

  // Validate repository
  if (!validateRepository('remote')) {
    process.exit(1);
  }

  // Handle different operations
  if (args.length === 0) {
    console.log(chalk.blue.bold('🔗 Listing remote repositories...'));
  } else if (args[0] === 'add' && args.length >= 3) {
    console.log(chalk.blue.bold(`🔗 Adding remote "${args[1]}"...`));
  } else if (args[0] === 'remove' && args.length >= 2) {
    console.log(chalk.blue.bold(`🔗 Removing remote "${args[1]}"...`));
  } else if (args[0] === 'set-url' && args.length >= 2) {
    const remoteName = args[2] || 'origin';
    console.log(chalk.blue.bold(`🔗 Setting URL for remote "${remoteName}"...`));
  }

  // Get the MCP CLI path
  const mcpCliPath = path.join(path.dirname(process.argv[1]), '..', '..', 'mcp-cli.js');
  
  // Map to MCP commands
  let mcpCommand;
  let mcpArgs = [];
  
  if (args.length === 0) {
    mcpCommand = 'git-remote-list';
  } else if (args[0] === 'add') {
    mcpCommand = 'git-remote-add';
    mcpArgs = args.slice(1);
  } else if (args[0] === 'remove') {
    mcpCommand = 'git-remote-remove';
    mcpArgs = args.slice(1);
  } else if (args[0] === 'set-url') {
    mcpCommand = 'git-remote-set-url';
    mcpArgs = args.slice(1);
  } else {
    console.error(chalk.red.bold('❌ Invalid remote operation'));
    console.log(chalk.yellow('💡 Run: gremote --help for usage information'));
    process.exit(1);
  }

  const mcpProcess = spawn('node', [mcpCliPath, mcpCommand, ...mcpArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green.bold('✅ Remote operation completed successfully!'));
    } else {
      console.error(chalk.red.bold(`❌ Remote operation failed (code: ${code})`));
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
