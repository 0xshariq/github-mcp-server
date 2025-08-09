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

// Colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}↩️  greset - Enhanced Git Reset${colors.reset}

${colors.yellow}Usage:${colors.reset}
  greset                    Reset staging area (keep working directory)
  greset --soft HEAD~1      Undo last commit (keep changes staged)
  greset --hard HEAD~1      Undo last commit (discard all changes)
  greset --mixed HEAD~1     Undo last commit (unstage changes)
  greset <file>            Unstage specific file
  greset --help, -h        Show this help

${colors.yellow}Examples:${colors.reset}
  ${colors.green}greset${colors.reset}                    Reset staging area
  ${colors.green}greset --soft HEAD~1${colors.reset}      Undo last commit, keep changes staged
  ${colors.green}greset src/file.js${colors.reset}       Unstage specific file
  ${colors.green}greset --hard HEAD~1${colors.reset}      ${colors.red}⚠️  Dangerous: Discards changes!${colors.reset}

${colors.yellow}Reset Modes:${colors.reset}
  ${colors.blue}--soft${colors.reset}   Keep changes staged
  ${colors.blue}--mixed${colors.reset}  Keep changes in working directory (default)
  ${colors.blue}--hard${colors.reset}   ${colors.red}⚠️  Discard all changes (destructive!)${colors.reset}

${colors.red}⚠️  WARNING: --hard will permanently delete uncommitted changes!${colors.reset}
`);
}

// Get command line arguments (excluding node and script name)
const args = process.argv.slice(2);

// Check for help flags
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

console.log(`${colors.blue}🎯 Executing git reset...${colors.reset}`);

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');

const mcpProcess = spawn('node', [mcpCliPath, 'git-reset', ...args], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mcpProcess.on('close', (code) => {
  process.exit(code);
});

mcpProcess.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
