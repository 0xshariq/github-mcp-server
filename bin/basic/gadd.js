#!/usr/bin/env node

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
${colors.cyan}${colors.bright}📝 gadd - Enhanced Git Add Alias${colors.reset}

${colors.yellow}Usage:${colors.reset}
  gadd                    Add all modified files (smart mode)
  gadd file1 file2...     Add specific files
  gadd --help, -h         Show this help
  gadd --status, -s       Show status before adding

${colors.yellow}Examples:${colors.reset}
  ${colors.green}gadd${colors.reset}                    Smart add all changes
  ${colors.green}gadd src/file.js${colors.reset}        Add specific file
  ${colors.green}gadd -s${colors.reset}                 Check status first
`);
}

async function runCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Git command failed with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--status') || args.includes('-s')) {
    console.log(`${colors.blue}📊 Current repository status:${colors.reset}`);
    try {
      await runCommand(['status', '--porcelain']);
      return;
    } catch (error) {
      console.error(`${colors.red}Error:${colors.reset}`, error.message);
      process.exit(1);
    }
  }
  
  try {
    if (args.length === 0) {
      console.log(`${colors.blue}🚀 Smart add mode: adding all changes...${colors.reset}`);
      await runCommand(['add', '.']);
    } else {
      const files = args.filter(arg => !arg.startsWith('-'));
      if (files.length > 0) {
        console.log(`${colors.blue}📁 Adding files: ${files.join(', ')}${colors.reset}`);
        await runCommand(['add', ...files]);
      } else {
        console.log(`${colors.red}❌ No files specified.${colors.reset}`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`${colors.red}❌ Add failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    process.exit(1);
  });
}
