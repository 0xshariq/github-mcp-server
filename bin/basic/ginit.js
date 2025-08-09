#!/usr/bin/env node

/**
 * ginit - Enhanced Git Initialize Alias
 *
 * Usage:
 *   ginit                   Initialize new Git repository
 *   ginit --help, -h        Show help
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import chalk from "chalk";
  

function showHelp() {
  console.log();
  console.log(chalk.bold.cyan('🎯 ginit') + chalk.gray(' - ') + chalk.bold.white('Enhanced Git Initialize'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log();
  
  console.log(chalk.bold.yellow('Usage:'));
  console.log(chalk.green('  ginit') + chalk.gray('              Initialize new Git repository in current directory'));
  console.log(chalk.green('  ginit --help, -h') + chalk.gray('   Show this help'));
  console.log();
  
  console.log(chalk.bold.yellow('Examples:'));
  console.log(chalk.blue('  ginit') + chalk.gray('              Create new Git repository'));
  console.log();
  
  console.log(chalk.bold.yellow('What it does:'));
  console.log(chalk.cyan('  •') + chalk.white(' Checks if directory is already a Git repository'));
  console.log(chalk.cyan('  •') + chalk.white(' Creates .git directory and initializes repository'));
}

function executeGitCommand(gitArgs) {
  return new Promise((resolve, reject) => {
    const gitProcess = spawn("git", gitArgs, { stdio: "inherit" });
    gitProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Git command failed with code ${code}`));
      }
    });
    gitProcess.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  // Check for help flags
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    return;
  }

  const gitDir = path.join(process.cwd(), ".git");
  if (fs.existsSync(gitDir)) {
    console.log(
      `${colors.green}✅ This directory is already a Git repository.${colors.reset}`
    );
    return;
  }

  console.log(
    `${colors.blue}🚀 Initializing a new Git repository...${colors.reset}`
  );
  try {
    await executeGitCommand(["init"]);
    console.log(
      `${colors.green}🎉 Successfully initialized empty Git repository.${colors.reset}`
    );
    console.log(
      `${colors.yellow}💡 Next: Use 'gadd .' to add files and 'gcommit "message"' to commit${colors.reset}`
    );
  } catch (error) {
    console.error(
      `${colors.red}❌ Error initializing repository: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

main();
