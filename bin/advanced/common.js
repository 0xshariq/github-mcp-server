/**
 * Common utilities for Git aliases
 * Provides repository validation and safety checks
 */

import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';

/**
 * Get current repository information
 */
function getRepoInfo() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const repoName = remoteUrl.split('/').pop().replace('.git', '');
    const currentDir = path.basename(process.cwd());
    
    return {
      remoteUrl,
      currentBranch,
      repoName,
      currentDir,
      workingDir: process.cwd()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Display repository context
 */
function showRepoContext() {
  const info = getRepoInfo();
  if (!info) {
    console.log(chalk.yellow('⚠️  Not in a Git repository'));
    return false;
  }
  
  console.log(chalk.blue('📁 Repository: ') + chalk.bold.white(info.repoName) + chalk.gray(` (${info.currentDir})`));
  console.log(chalk.green('🌿 Branch: ') + chalk.bold.cyan(info.currentBranch));
  console.log(chalk.magenta('🔗 Remote: ') + chalk.dim(info.remoteUrl));
  console.log(chalk.yellow('📍 Working Directory: ') + chalk.dim(info.workingDir));
  return true;
}

/**
 * Validate repository safety
 */
function validateRepository(operation = 'operation') {
  const info = getRepoInfo();
  if (!info) {
    console.error(chalk.red(`❌ Error: Not in a Git repository`));
    console.log(chalk.yellow(`💡 Navigate to your project directory and try again`));
    return false;
  }
  
  // Show context before dangerous operations
  if (operation.includes('push') || operation.includes('flow')) {
    console.log(chalk.blue(`🔍 Repository Context Check:`));
    showRepoContext();
    console.log(''); // blank line
  }
  
  return true;
}

/**
 * Standard help header
 */
function showHelp(command, description, usage, examples = []) {
  console.log();
  console.log(chalk.bold.cyan(`🚀 ${command}`) + chalk.gray(' - ') + chalk.bold.white(description));
  console.log(chalk.dim('═'.repeat(50)));
  console.log();
  
  console.log(chalk.bold.yellow('Usage:'));
  console.log(usage.split('\n').map(line => line.trim() ? chalk.green(line.trim()) : '').join('\n'));
  console.log();
  
  if (examples.length > 0) {
    console.log(chalk.bold.yellow('Examples:'));
    examples.forEach(ex => console.log(chalk.blue(`  ${ex}`)));
    console.log();
  }
  
  console.log(chalk.bold.green('💡 This command respects your current working directory and repository.'));
  console.log();
}

export default {
  getRepoInfo,
  showRepoContext,
  validateRepository,
  showHelp
};
