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

// Colors for better output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}🎯 ginit - Enhanced Git Initialize${colors.reset}

${colors.yellow}Usage:${colors.reset}
  ginit              Initialize new Git repository in current directory
  ginit --help, -h   Show this help

${colors.yellow}Examples:${colors.reset}
  ${colors.green}ginit${colors.reset}              Create new Git repository

${colors.yellow}What it does:${colors.reset}
  • Checks if directory is already a Git repository
  • Creates .git directory and initializes repository
  • Sets up initial Git configuration

${colors.yellow}Next steps after ginit:${colors.reset}
  ${colors.green}gadd ${colors.reset}                      By Default Add all files (If you give file name, it will add that file)
  ${colors.green}gcommit "Initial commit"${colors.reset}   Create first commit
  ${colors.green}gremote add origin <url>${colors.reset}   Add remote repository
`);
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
