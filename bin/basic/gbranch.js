#!/usr/bin/env node

/**
 * gbranch - Enhanced Git Branch Alias
 * 
 * Usage:
 *   gbranch                    - List all branches
 *   gbranch "new-branch"       - Create new branch
 *   gbranch -h, --help         - Show help
 *   gbranch --context          - Show repository context
 * 
 * Features:
 * - Repository context validation
 * - Branch creation and listing
 * - Safety checks
 */

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import common from '../advanced/common.js';

const { validateRepository, showHelp, showRepoContext } = common;

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  showHelp(
    'gbranch',
    'Enhanced Git Branch Management',
    `  gbranch                    List all branches
  gbranch "new-branch"       Create new branch
  gbranch --context          Show repository context
  gbranch -h, --help         Show this help`,
    [
      'gbranch                    # List all branches',
      'gbranch "feature/login"    # Create new branch',
      'gbranch --context          # Show repo info'
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
if (!validateRepository('branch')) {
  process.exit(1);
}

// Determine operation
const branchName = args.join(' ').trim();
if (branchName) {
  console.log(`� Creating branch: "${branchName}"`);
} else {
  console.log('🌿 Listing all branches...');
}

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');
const mcpArgs = branchName ? ['git-branch', branchName] : ['git-branch'];

const mcpProcess = spawn('node', [mcpCliPath, ...mcpArgs], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  if (code === 0 && branchName) {
    console.log(`💡 Tip: Use "gcheckout ${branchName}" to switch to this branch`);
  }
  process.exit(code);
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
