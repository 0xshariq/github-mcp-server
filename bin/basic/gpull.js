#!/usr/bin/env node

/**
 * gpull - Enhanced Git Pull Alias
 * 
 * Usage:
 *   gpull                 - Pull from remote repository
 *   gpull -h, --help      - Show help
 *   gpull --status        - Show status after pull
 *   gpull --context       - Show repository context first
 * 
 * Features:
 * - Repository context validation
 * - Safe pull with context awareness
 * - Post-pull status option
 */

import { spawn } from 'child_process';
import path from 'path';
import { validateRepository, showHelp, showRepoContext } from '../advanced/common';

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  showHelp(
    'gpull',
    'Enhanced Git Pull from Remote',
    `  gpull                 Pull latest changes from remote
  gpull --status        Show status after pull
  gpull --context       Show repository context first
  gpull -h, --help      Show this help`,
    [
      'gpull                 # Pull latest changes',
      'gpull --status        # Pull and show status',
      'gpull --context       # Check repo info first'
    ]
  );
  process.exit(0);
}

// Show context if requested
if (args.includes('--context')) {
  showRepoContext();
  process.exit(0);
}

// Validate repository
if (!validateRepository('pull')) {
  process.exit(1);
}

console.log('⬇️  Pulling from remote repository...');

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');

const mcpProcess = spawn('node', [mcpCliPath, 'git-pull'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  if (code === 0) {
    if (args.includes('--status')) {
      console.log('\n📊 Repository status after pull:');
      const statusProcess = spawn('node', [mcpCliPath, 'git-status'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      statusProcess.on('close', () => process.exit(0));
    } else {
      console.log('💡 Tip: Use "gstatus" to see current repository state');
      process.exit(0);
    }
  } else {
    process.exit(code);
  }
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
