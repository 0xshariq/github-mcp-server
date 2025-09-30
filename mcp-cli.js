#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the command name from the actual command used to invoke this script
// Handle both direct calls and npm/pnpm symlinks
const fullPath = process.argv[1];
let commandName = path.basename(fullPath);

// For pnpm-generated wrappers, we need a more reliable detection method
if (commandName === 'mcp-cli.js') {
  let detectedCommand = null;
  
  // Method 1: Check the parent process command line to find the wrapper name
  try {
    const ppid = process.ppid;
    if (ppid) {
      const psOutput = execSync(`ps -p ${ppid} -o args= 2>/dev/null || echo ""`, { encoding: 'utf8' }).trim();
      // Look for patterns like "bash /path/to/gstatus" or "sh /path/to/gadd"
      const wrapperMatch = psOutput.match(/(?:bash|sh|dash)\s+.*?\/([g][a-z]+)(?:\s|$)/);
      if (wrapperMatch && wrapperMatch[1]) {
        detectedCommand = wrapperMatch[1];
      }
    }
  } catch (e) {
    // Ignore ps command errors
  }
  
  // Method 2: Check process.env._ as fallback
  if (!detectedCommand && process.env._) {
    const envCommand = path.basename(process.env._);
    if (envCommand.startsWith('g') && envCommand !== 'github-mcp-server' && envCommand !== 'global') {
      detectedCommand = envCommand;
    }
  }
  
  // Method 3: Try to find the most recently accessed wrapper script
  if (!detectedCommand) {
    try {
      const pnpmBinDir = '/home/sharique/.local/share/pnpm';
      const gitAliases = ['gstatus', 'gadd', 'gcommit', 'gpush', 'gpull', 'gbranch', 'gcheckout', 'gclone', 
                         'gdiff', 'glog', 'gremote', 'greset', 'gstash', 'gpop', 'ginit', 'gflow', 'gquick', 
                         'gsync', 'gdev', 'gworkflow', 'gfix', 'gfresh', 'gbackup', 'gclean', 'gsave', 
                         'glist', 'grelease'];
      
      let latestTime = 0;
      let latestCommand = null;
      
      for (const alias of gitAliases) {
        const wrapperPath = path.join(pnpmBinDir, alias);
        if (fs.existsSync(wrapperPath)) {
          const stats = fs.statSync(wrapperPath);
          if (stats.atimeMs > latestTime) {
            latestTime = stats.atimeMs;
            latestCommand = alias;
          }
        }
      }
      
      // Only use this if the access time is very recent (within last 5 seconds)
      if (latestCommand && (Date.now() - latestTime < 5000)) {
        detectedCommand = latestCommand;
      }
    } catch (e) {
      // Ignore file system errors
    }
  }
  
  if (detectedCommand) {
    commandName = detectedCommand;
  }
}

// Special case: if we get gms as command name but have args, 
// and the first arg looks like a g* command, use that instead
if (commandName === 'gms' && process.argv.length > 2) {
  const potentialCommand = process.argv[2];
  if (potentialCommand && potentialCommand.startsWith('g')) {
    // Check if this looks like a git command being forwarded incorrectly
    // This happens when the system interprets gstatus as "gms git-status"
    if (potentialCommand.includes('-')) {
      // Convert "git-status" back to "gstatus", "add-all" to "gadd", etc.
      const parts = potentialCommand.split('-');
      if (parts[0] === 'git') {
        commandName = 'g' + parts[1];
      } else if (parts.length === 2) {
        // Handle cases like "add-all" -> "gadd"
        commandName = 'g' + parts[0];
      } else {
        commandName = potentialCommand.replace('-', '');
      }
      // Remove this argument from process.argv so it doesn't get passed to the script
      process.argv.splice(2, 1);
    } else {
      commandName = potentialCommand;
    }
  }
}

// Alias mapping for routing commands to their respective scripts
const aliasMap = {
  // Basic Git operations
  'gadd': { script: 'bin/basic/gadd.js', description: 'Add files to staging' },
  'gcommit': { script: 'bin/basic/gcommit.js', description: 'Commit changes' },
  'ginit': { script: 'bin/basic/ginit.js', description: 'Initialize repository' },
  'gstatus': { script: 'bin/basic/gstatus.js', description: 'Show repository status' },
  'gpush': { script: 'bin/basic/gpush.js', description: 'Push changes to remote' },
  'gpull': { script: 'bin/basic/gpull.js', description: 'Pull changes from remote' },
  'gbranch': { script: 'bin/basic/gbranch.js', description: 'Branch operations' },
  'gcheckout': { script: 'bin/basic/gcheckout.js', description: 'Switch branches' },
  'gclone': { script: 'bin/basic/gclone.js', description: 'Clone repository' },
  'gdiff': { script: 'bin/basic/gdiff.js', description: 'Show differences' },
  'glog': { script: 'bin/basic/glog.js', description: 'Show commit history' },
  'gremote': { script: 'bin/basic/gremote.js', description: 'Remote operations' },
  'greset': { script: 'bin/basic/greset.js', description: 'Reset repository state' },
  'gstash': { script: 'bin/basic/gstash.js', description: 'Stash operations' },
  'gpop': { script: 'bin/basic/gpop.js', description: 'Pop stash' },

  // Advanced Git operations
  'gbackup': { script: 'bin/advanced/gbackup.js', description: 'Backup current state' },
  'gclean': { script: 'bin/advanced/gclean.js', description: 'Clean repository' },
  'gdev': { script: 'bin/advanced/gdev.js', description: 'Development workflow' },
  'gfix': { script: 'bin/advanced/gfix.js', description: 'Fix operations' },
  'gflow': { script: 'bin/advanced/gflow.js', description: 'Complete workflow' },
  'gfresh': { script: 'bin/advanced/gfresh.js', description: 'Fresh start' },
  'glist': { script: 'bin/advanced/glist.js', description: 'List repositories' },
  'gquick': { script: 'bin/advanced/gquick.js', description: 'Quick commit' },
  'grelease': { script: 'bin/advanced/grelease.js', description: 'Release workflow' },
  'gsave': { script: 'bin/advanced/gsave.js', description: 'Save current state' },
  'gsync': { script: 'bin/advanced/gsync.js', description: 'Synchronize repository' },
  'gworkflow': { script: 'bin/advanced/gworkflow.js', description: 'Complete workflow' }
};

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  // Remove debug output for production
  
  // Detect if we're being called as an alias (e.g., gbranch, gadd, etc.)
  let command;
  let commandArgs = args;
  
  if (commandName === 'mcp-cli.js' || commandName === 'github-mcp-server') {
    // Called as main CLI - command is first argument
    if (args.length === 0) {
      showUsage();
      return;
    }
    command = args[0];
    commandArgs = args.slice(1);
  } else {
    // Called as alias (e.g., gbranch, gadd, etc.)
    command = commandName;
    commandArgs = args;
  }

  // Check if it's a valid alias and route to script
  if (aliasMap[command] && aliasMap[command].script) {
    const scriptPath = path.join(__dirname, aliasMap[command].script);
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(chalk.red.bold('❌ Script not found:'), scriptPath);
      process.exit(1);
    }
    
    // Execute the script with the provided arguments
    const childProcess = spawn('node', [scriptPath, ...commandArgs], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    childProcess.on('close', (code) => {
      process.exit(code);
    });

    childProcess.on('error', (err) => {
      console.error(chalk.red.bold('❌ Error executing script:'), err.message);
      process.exit(1);
    });
  } else {
    console.error(chalk.red.bold(`❌ Unknown command: ${command}`));
    showUsage();
    process.exit(1);
  }
}

function showUsage() {
  console.log();
  console.log(chalk.bold.cyan('🚀 MCP Git CLI') + chalk.gray(' - ') + chalk.bold.white('Enhanced Git Operations'));
  console.log(chalk.dim('═'.repeat(60)));
  console.log();
  
  console.log(chalk.bold.yellow('Basic Operations:'));
  console.log(chalk.green('  gadd, gcommit, ginit, gstatus, gpush, gpull'));
  console.log(chalk.green('  gbranch, gcheckout, gclone, gdiff, glog'));
  console.log(chalk.green('  gremote, greset, gstash, gpop'));
  console.log();
  
  console.log(chalk.bold.yellow('Advanced Operations:'));
  console.log(chalk.green('  gbackup, gclean, gdev, gfix, gflow, gfresh'));
  console.log(chalk.green('  glist, gquick, grelease, gsave, gsync, gworkflow'));
  console.log();
  
  console.log(chalk.bold.yellow('Usage:'));
  console.log(chalk.blue('  mcp-cli <command> [arguments]'));
  console.log(chalk.blue('  <command> --help') + chalk.gray('           Show help for specific command'));
  console.log();
}

// ESM module detection and execution - always run main if this is the primary module
main().catch((error) => {
  console.error(chalk.red.bold('❌ Fatal error:'), error.message);
  process.exit(1);
});
