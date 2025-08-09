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
${colors.cyan}${colors.bright}📥 gclone - Enhanced Git Clone${colors.reset}

${colors.yellow}Usage:${colors.reset}
  gclone <repository-url>              Clone repository to current directory
  gclone <repository-url> <directory>  Clone repository to specific directory
  gclone --help, -h                    Show this help

${colors.yellow}Examples:${colors.reset}
  ${colors.green}gclone https://github.com/user/repo.git${colors.reset}
  ${colors.green}gclone https://github.com/user/repo.git my-project${colors.reset}
  ${colors.green}gclone git@github.com:user/repo.git${colors.reset}

${colors.yellow}What it does:${colors.reset}
  • Downloads the complete repository from remote
  • Sets up local working directory
  • Configures remote origin automatically
`);
}

// Get command line arguments (excluding node and script name)
const args = process.argv.slice(2);

// Check for help flags
if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Validate arguments
if (args.length === 0) {
  console.error(`${colors.red}❌ Error: Repository URL is required${colors.reset}`);
  console.log(`${colors.yellow}💡 Usage: gclone <repository-url> [directory]${colors.reset}`);
  console.log(`${colors.yellow}💡 Run: gclone --help for more information${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.blue}🎯 Cloning repository...${colors.reset}`);

// Get the MCP CLI path
const mcpCliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');

const mcpProcess = spawn('node', [mcpCliPath, 'git-clone', ...args], {
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
