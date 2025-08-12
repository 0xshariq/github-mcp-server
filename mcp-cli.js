#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  'gworkflow': { script: 'bin/advanced/gworkflow.js', description: 'Complete workflow' },

  // MCP server operations
  'git-init': { handler: 'gitInit' },
  'git-add': { handler: 'gitAdd' },
  'git-add-all': { handler: 'gitAddAll' },
  'git-commit': { handler: 'gitCommit' },
  'git-status': { handler: 'gitStatus' },
  'git-push': { handler: 'gitPush' },
  'git-pull': { handler: 'gitPull' },
  'git-branch': { handler: 'gitBranch' },
  'git-checkout': { handler: 'gitCheckout' },
  'git-clone': { handler: 'gitClone' },
  'git-diff': { handler: 'gitDiff' },
  'git-log': { handler: 'gitLog' },
  'git-flow': { handler: 'gitFlow' },
  'git-remote-list': { handler: 'gitRemoteList' },
  'git-remote-add': { handler: 'gitRemoteAdd' },
  'git-remote-remove': { handler: 'gitRemoteRemove' },
  'git-remote-set-url': { handler: 'gitRemoteSetUrl' },
  'git-reset': { handler: 'gitReset' },
  'git-stash': { handler: 'gitStash' },
  'git-stash-pop': { handler: 'gitStashPop' }
};

// MCP server handlers
async function gitInit() {
  console.log(chalk.blue.bold('🎯 Initializing Git repository...'));
  return runGitCommand(['init']);
}

async function gitAdd(files = []) {
  console.log(chalk.blue.bold(`📝 Adding ${files.length > 0 ? files.join(', ') : 'files'}...`));
  return runGitCommand(['add', ...files]);
}

async function gitAddAll() {
  console.log(chalk.blue.bold('📝 Adding all changes...'));
  return runGitCommand(['add', '.']);
}

async function gitCommit(message) {
  console.log(chalk.blue.bold('🚀 Committing changes...'));
  console.log(chalk.gray(`📝 Message: "${message}"`));
  return runGitCommand(['commit', '-m', message]);
}

async function gitStatus() {
  console.log(chalk.blue.bold('📊 Repository Status'));
  console.log(chalk.dim('═'.repeat(40)));
  return runGitCommand(['status', '--porcelain', '-b'], true);
}

async function gitPush() {
  console.log(chalk.blue.bold('⬆️ Pushing changes...'));
  return runGitCommand(['push']);
}

async function gitPull() {
  console.log(chalk.blue.bold('⬇️ Pulling changes...'));
  return runGitCommand(['pull']);
}

async function gitBranch(branchName) {
  if (branchName) {
    console.log(chalk.blue.bold(`🌿 Creating branch: ${branchName}`));
    return runGitCommand(['branch', branchName]);
  } else {
    console.log(chalk.blue.bold('🌿 Listing branches:'));
    return runGitCommand(['branch', '-a'], true);
  }
}

async function gitCheckout(branchName, createNew = false) {
  const args = ['checkout'];
  if (createNew) args.push('-b');
  args.push(branchName);
  
  console.log(chalk.blue.bold(`🔄 ${createNew ? 'Creating and switching' : 'Switching'} to branch: ${branchName}`));
  return runGitCommand(args);
}

async function gitClone(url, targetDir) {
  const args = ['clone', url];
  if (targetDir) args.push(targetDir);
  
  console.log(chalk.blue.bold(`📥 Cloning repository: ${url}`));
  return runGitCommand(args);
}

async function gitDiff(target) {
  console.log(chalk.blue.bold('🔍 Showing differences:'));
  const args = ['diff'];
  if (target) args.push(target);
  return runGitCommand(args, true);
}

async function gitLog(maxCount = 10) {
  console.log(chalk.blue.bold('📖 Commit History:'));
  return runGitCommand(['log', '--oneline', `--max-count=${maxCount}`, '--graph'], true);
}

async function gitRemoteList() {
  console.log(chalk.blue.bold('🔗 Remote repositories:'));
  return runGitCommand(['remote', '-v'], true);
}

async function gitRemoteAdd(name, url) {
  console.log(chalk.blue.bold(`🔗 Adding remote: ${name}`));
  return runGitCommand(['remote', 'add', name, url]);
}

async function gitRemoteRemove(name) {
  console.log(chalk.blue.bold(`🗑️ Removing remote: ${name}`));
  return runGitCommand(['remote', 'remove', name]);
}

async function gitRemoteSetUrl(name, url) {
  console.log(chalk.blue.bold(`🔗 Setting URL for remote: ${name}`));
  return runGitCommand(['remote', 'set-url', name, url]);
}

async function gitReset(target = 'HEAD', mode = 'mixed') {
  console.log(chalk.blue.bold(`↩️ Resetting to: ${target}`));
  return runGitCommand(['reset', `--${mode}`, target]);
}

async function gitStash(message) {
  const args = ['stash'];
  if (message) {
    args.push('save', message);
    console.log(chalk.blue.bold(`💾 Stashing changes: "${message}"`));
  } else {
    console.log(chalk.blue.bold('💾 Stashing changes...'));
  }
  return runGitCommand(args);
}

async function gitStashPop() {
  console.log(chalk.blue.bold('📤 Applying stashed changes...'));
  return runGitCommand(['stash', 'pop']);
}

async function gitFlow(message) {
  console.log(chalk.blue.bold('⚡ Starting Complete Git Workflow...'));
  console.log(chalk.dim('═'.repeat(50)));
  console.log(chalk.blue('📝 Commit message:'), chalk.white(`"${message}"`));
  console.log();

  try {
    // Step 1: Add all changes
    console.log(chalk.cyan.bold('📁 Step 1: Adding all changes...'));
    await runGitCommand(['add', '.']);
    console.log(chalk.green('✅ All changes added to staging area'));
    console.log();

    // Step 2: Commit changes
    console.log(chalk.cyan.bold('💾 Step 2: Committing changes...'));
    await runGitCommand(['commit', '-m', message]);
    console.log(chalk.green('✅ Changes committed successfully'));
    console.log();

    // Step 3: Push to remote
    console.log(chalk.cyan.bold('🚀 Step 3: Pushing to remote repository...'));
    await runGitCommand(['push']);
    console.log(chalk.green('✅ Changes pushed to remote'));
    console.log();

    console.log(chalk.green.bold('🎉 Complete workflow finished successfully!'));
    console.log(chalk.cyan('💡 Your changes are now live on the remote repository'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Workflow step failed:'), error.message);
    throw error;
  }
}

// Helper function to run git commands with styled output
function runGitCommand(args, captureOutput = false, showProgress = true) {
  return new Promise((resolve, reject) => {
    if (showProgress) {
      console.log(chalk.gray(`   🔧 Running: git ${args.join(' ')}`));
    }

    const gitProcess = spawn('git', args, {
      stdio: captureOutput ? 'pipe' : 'inherit',
      cwd: process.cwd()
    });

    if (captureOutput) {
      let stdout = '';
      let stderr = '';

      gitProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          if (stdout.trim()) {
            // Style the output based on command type
            const styledOutput = styleGitOutput(stdout, args[0]);
            console.log(styledOutput);
          }
          if (showProgress) {
            console.log(chalk.gray(`   ✓ Command completed successfully`));
          }
          resolve();
        } else {
          console.error(chalk.red.bold('❌ Git command failed:'));
          console.error(chalk.gray(`   Command: git ${args.join(' ')}`));
          if (stderr) console.error(chalk.red(`   Error: ${stderr.trim()}`));
          reject(new Error(`Git command failed with code ${code}`));
        }
      });
    } else {
      gitProcess.on('close', (code) => {
        if (code === 0) {
          if (showProgress) {
            console.log(chalk.green('   ✓ Operation completed successfully!'));
          }
          resolve();
        } else {
          console.error(chalk.red.bold(`❌ Git command failed (code: ${code})`));
          console.error(chalk.gray(`   Command: git ${args.join(' ')}`));
          reject(new Error(`Git command failed with code ${code}`));
        }
      });
    }

    gitProcess.on('error', (err) => {
      console.error(chalk.red.bold('❌ Process error:'), err.message);
      console.error(chalk.gray(`   Command: git ${args.join(' ')}`));
      reject(err);
    });
  });
}

// Style git output based on command type
function styleGitOutput(output, command) {
  const lines = output.trim().split('\n');
  
  switch (command) {
    case 'status':
      return styleStatusOutput(lines);
    case 'branch':
      return styleBranchOutput(lines);
    case 'log':
      return styleLogOutput(lines);
    case 'diff':
      return styleDiffOutput(lines);
    case 'remote':
      return styleRemoteOutput(lines);
    default:
      return lines.map(line => chalk.gray(line)).join('\n');
  }
}

function styleStatusOutput(lines) {
  return lines.map(line => {
    if (line.startsWith('## ')) {
      return chalk.cyan.bold(`🌿 ${line.slice(3)}`);
    } else if (line.startsWith('M ')) {
      return chalk.yellow(`📝 Modified: ${line.slice(3)}`);
    } else if (line.startsWith('A ')) {
      return chalk.green(`➕ Added: ${line.slice(3)}`);
    } else if (line.startsWith('D ')) {
      return chalk.red(`❌ Deleted: ${line.slice(3)}`);
    } else if (line.startsWith('?? ')) {
      return chalk.blue(`❓ Untracked: ${line.slice(3)}`);
    } else if (line.startsWith(' M ')) {
      return chalk.yellow(`📝 Modified (unstaged): ${line.slice(3)}`);
    } else if (line.startsWith(' D ')) {
      return chalk.red(`❌ Deleted (unstaged): ${line.slice(3)}`);
    } else {
      return chalk.gray(line);
    }
  }).join('\n');
}

function styleBranchOutput(lines) {
  return lines.map(line => {
    if (line.startsWith('* ')) {
      return chalk.green.bold(`👉 ${line.slice(2)} (current)`);
    } else if (line.includes('remotes/')) {
      return chalk.blue(`🔗 ${line.trim()}`);
    } else {
      return chalk.white(`🌿 ${line.trim()}`);
    }
  }).join('\n');
}

function styleLogOutput(lines) {
  return lines.map(line => {
    if (line.includes('*')) {
      return chalk.yellow(line);
    } else {
      return chalk.gray(line);
    }
  }).join('\n');
}

function styleDiffOutput(lines) {
  return lines.map(line => {
    if (line.startsWith('+')) {
      return chalk.green(line);
    } else if (line.startsWith('-')) {
      return chalk.red(line);
    } else if (line.startsWith('@@')) {
      return chalk.cyan(line);
    } else {
      return chalk.gray(line);
    }
  }).join('\n');
}

function styleRemoteOutput(lines) {
  return lines.map(line => {
    const [name, url, type] = line.split('\t');
    if (type && type.includes('fetch')) {
      return chalk.blue(`📥 ${name}: ${url}`);
    } else if (type && type.includes('push')) {
      return chalk.green(`📤 ${name}: ${url}`);
    } else {
      return chalk.white(`🔗 ${line}`);
    }
  }).join('\n');
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showUsage();
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  // Check if it's an alias that should route to a script
  if (aliasMap[command] && aliasMap[command].script) {
    console.log(chalk.blue.bold(`🚀 Executing: ${command}`));
    console.log(chalk.gray(`📁 Using script: ${aliasMap[command].script}`));
    
    const scriptPath = path.join(__dirname, aliasMap[command].script);
    
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
  }
  // Check if it's a direct MCP handler
  else if (aliasMap[command] && aliasMap[command].handler) {
    try {
      const handlerName = aliasMap[command].handler;
      
      switch (handlerName) {
        case 'gitInit':
          await gitInit();
          break;
        case 'gitAdd':
          await gitAdd(commandArgs);
          break;
        case 'gitAddAll':
          await gitAddAll();
          break;
        case 'gitCommit':
          if (commandArgs.length === 0) {
            console.error(chalk.red.bold('❌ Commit message required'));
            process.exit(1);
          }
          await gitCommit(commandArgs.join(' '));
          break;
        case 'gitStatus':
          await gitStatus();
          break;
        case 'gitPush':
          await gitPush();
          break;
        case 'gitPull':
          await gitPull();
          break;
        case 'gitFlow':
          if (commandArgs.length === 0) {
            console.error(chalk.red.bold('❌ Commit message required for workflow'));
            process.exit(1);
          }
          await gitFlow(commandArgs.join(' '));
          break;
        case 'gitBranch':
          await gitBranch(commandArgs[0]);
          break;
        case 'gitCheckout':
          await gitCheckout(commandArgs[0], commandArgs.includes('-b'));
          break;
        case 'gitClone':
          await gitClone(commandArgs[0], commandArgs[1]);
          break;
        case 'gitDiff':
          await gitDiff(commandArgs[0]);
          break;
        case 'gitLog':
          await gitLog(commandArgs[0] ? parseInt(commandArgs[0]) : 10);
          break;
        case 'gitRemoteList':
          await gitRemoteList();
          break;
        case 'gitRemoteAdd':
          if (commandArgs.length < 2) {
            console.error(chalk.red.bold('❌ Remote name and URL required'));
            process.exit(1);
          }
          await gitRemoteAdd(commandArgs[0], commandArgs[1]);
          break;
        case 'gitRemoteRemove':
          await gitRemoteRemove(commandArgs[0]);
          break;
        case 'gitRemoteSetUrl':
          await gitRemoteSetUrl(commandArgs[0], commandArgs[1]);
          break;
        case 'gitReset':
          await gitReset(commandArgs[0], commandArgs[1]);
          break;
        case 'gitStash':
          await gitStash(commandArgs.join(' '));
          break;
        case 'gitStashPop':
          await gitStashPop();
          break;
        default:
          console.error(chalk.red.bold(`❌ Unknown handler: ${handlerName}`));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red.bold('❌ Operation failed:'), error.message);
      process.exit(1);
    }
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
