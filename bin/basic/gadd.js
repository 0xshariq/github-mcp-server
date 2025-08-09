#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';

function showHelp() {
  console.log();
  console.log(chalk.bold.cyan('📝 gadd') + chalk.gray(' - ') + chalk.bold.white('Enhanced Git Add Alias'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log();
  
  console.log(chalk.bold.yellow('Usage:'));
  console.log(chalk.green('  gadd') + chalk.gray('                    Add all modified files (smart mode)'));
  console.log(chalk.green('  gadd file1 file2...') + chalk.gray('     Add specific files'));
  console.log(chalk.green('  gadd --help, -h') + chalk.gray('         Show this help'));
  console.log(chalk.green('  gadd --status, -s') + chalk.gray('       Show status before adding'));
  console.log();
  
  console.log(chalk.bold.yellow('Examples:'));
  console.log(chalk.blue('  gadd') + chalk.gray('                    Smart add all changes'));
  console.log(chalk.blue('  gadd src/file.js') + chalk.gray('        Add specific file'));
  console.log(chalk.blue('  gadd -s') + chalk.gray('                 Check status first'));
  console.log();
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
