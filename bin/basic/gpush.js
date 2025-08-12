#!/usr/bin/env node

/**
 * gpush - Enhanced Git Push Alias
 * 
 * Usage:
 *   gpush                    - Push to remote repository
 *   gpush --help, -h         - Show this help
 *   gpush --force            - Force push (use with caution)
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { validateRepository, showHelp } from '../advanced/common.js';

async function getRepositoryInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const remote = execSync('git config --get branch.' + branch + '.remote', { encoding: 'utf8' }).trim() || 'origin';
    const remoteUrl = execSync(`git config --get remote.${remote}.url`, { encoding: 'utf8' }).trim();
    
    return { branch, remote, remoteUrl };
  } catch (error) {
    return { branch: 'unknown', remote: 'origin', remoteUrl: 'unknown' };
  }
}

async function checkPushStatus() {
  try {
    const status = execSync('git status --porcelain=v1 -b', { encoding: 'utf8' });
    const lines = status.split('\n');
    const branchLine = lines[0];
    
    let ahead = 0;
    let behind = 0;
    
    const aheadMatch = branchLine.match(/ahead (\d+)/);
    const behindMatch = branchLine.match(/behind (\d+)/);
    
    if (aheadMatch) ahead = parseInt(aheadMatch[1]);
    if (behindMatch) behind = parseInt(behindMatch[1]);
    
    return { ahead, behind };
  } catch (error) {
    return { ahead: 0, behind: 0 };
  }
}

async function performPush(force = false) {
  const repoInfo = await getRepositoryInfo();
  const pushStatus = await checkPushStatus();
  
  console.log(chalk.bold.cyan('🚀 Git Push'));
  console.log(chalk.dim('═'.repeat(40)));
  console.log();
  
  // Show repository context
  console.log(chalk.bold.yellow('📍 Repository Context:'));
  console.log(chalk.cyan('   Branch: ') + chalk.green.bold(repoInfo.branch));
  console.log(chalk.cyan('   Remote: ') + chalk.blue(repoInfo.remote));
  console.log(chalk.cyan('   URL: ') + chalk.gray(repoInfo.remoteUrl));
  console.log();
  
  // Show push status
  if (pushStatus.ahead === 0 && pushStatus.behind === 0) {
    console.log(chalk.yellow.bold('ℹ️  Branch is up to date'));
    console.log(chalk.gray('Nothing to push'));
    return;
  }
  
  if (pushStatus.ahead > 0) {
    console.log(chalk.green.bold(`📤 ${pushStatus.ahead} commit(s) to push`));
  }
  
  if (pushStatus.behind > 0 && !force) {
    console.log(chalk.red.bold(`⚠️  ${pushStatus.behind} commit(s) behind remote`));
    console.log(chalk.yellow('💡 Consider running "gpull" first to integrate remote changes'));
    console.log(chalk.yellow('💡 Or use "gpush --force" to force push (⚠️  dangerous!)'));
    return;
  }
  
  console.log();
  
  if (force) {
    console.log(chalk.red.bold('⚠️  FORCE PUSH - This will overwrite remote history!'));
    console.log();
  }
  
  // Prepare push command
  const pushArgs = ['push'];
  if (force) {
    pushArgs.push('--force-with-lease'); // Safer than --force
  }
  pushArgs.push(repoInfo.remote, repoInfo.branch);
  
  console.log(chalk.blue.bold('🚀 Pushing to remote...'));
  console.log(chalk.gray(`Command: git ${pushArgs.join(' ')}`));
  console.log();
  
  return new Promise((resolve, reject) => {
    const gitProcess = spawn('git', pushArgs, {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    gitProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // Style the real-time output
      const lines = text.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          if (line.includes('Counting objects') || line.includes('Compressing objects')) {
            console.log(chalk.blue('📦 ' + line.trim()));
          } else if (line.includes('Writing objects')) {
            console.log(chalk.green('✍️  ' + line.trim()));
          } else if (line.includes('Total')) {
            console.log(chalk.cyan('📊 ' + line.trim()));
          } else {
            console.log(chalk.white('   ' + line.trim()));
          }
        }
      });
    });
    
    gitProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      // Style error output
      const lines = text.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          if (line.includes('To ') && line.includes('://')) {
            console.log(chalk.blue('🌐 ' + line.trim()));
          } else if (line.includes('->')) {
            console.log(chalk.green('✅ ' + line.trim()));
          } else if (line.includes('error') || line.includes('Error')) {
            console.log(chalk.red('❌ ' + line.trim()));
          } else {
            console.log(chalk.white('   ' + line.trim()));
          }
        }
      });
    });
    
    gitProcess.on('close', (code) => {
      console.log();
      if (code === 0) {
        console.log(chalk.green.bold('✅ Push successful!'));
        console.log(chalk.cyan('💡 Your changes are now available on the remote repository'));
        if (repoInfo.remoteUrl.includes('github.com')) {
          console.log(chalk.gray('💡 You can view your changes at: ' + repoInfo.remoteUrl.replace('.git', '')));
        }
      } else {
        console.log(chalk.red.bold('❌ Push failed'));
        if (errorOutput.includes('rejected')) {
          console.log(chalk.yellow('💡 Tip: Try "gpull" first to integrate remote changes'));
        }
        if (errorOutput.includes('non-fast-forward')) {
          console.log(chalk.yellow('💡 Tip: Use "gpush --force" only if you\'re sure about overwriting remote history'));
        }
      }
      resolve(code);
    });
    
    gitProcess.on('error', (err) => {
      console.error(chalk.red.bold('❌ Error:'), err.message);
      reject(err);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp('gpush', 'Enhanced Git Push', [
      'gpush                    Push to remote repository',
      'gpush --force            Force push (use with caution)',
      'gpush --help, -h         Show this help'
    ], [
      'gpush                    # Safe push to remote',
      'gpush --force            # Force push (dangerous!)'
    ], [
      '• Repository context validation',
      '• Safety checks before push',
      '• Styled push progress display',
      '• Smart conflict detection'
    ], '🚀');
    return;
  }

  // Validate repository
  if (!validateRepository('push')) {
    process.exit(1);
  }

  // Check for force flag
  const force = args.includes('--force') || args.includes('-f');
  
  // Perform the push
  try {
    const exitCode = await performPush(force);
    process.exit(exitCode || 0);
  } catch (error) {
    console.error(chalk.red.bold('❌ Push failed:'), error.message);
    process.exit(1);
  }
}

// ESM module detection
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
