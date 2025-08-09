/**
 * Common utilities for Git aliases
 * Provides repository validation and safety checks
 */

import { execSync } from 'child_process';
import path from 'path';

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
    console.log('⚠️  Not in a Git repository');
    return false;
  }
  
  console.log(`📁 Repository: ${info.repoName} (${info.currentDir})`);
  console.log(`🌿 Branch: ${info.currentBranch}`);
  console.log(`🔗 Remote: ${info.remoteUrl}`);
  console.log(`📍 Working Directory: ${info.workingDir}`);
  return true;
}

/**
 * Validate repository safety
 */
function validateRepository(operation = 'operation') {
  const info = getRepoInfo();
  if (!info) {
    console.error(`❌ Error: Not in a Git repository`);
    console.log(`💡 Navigate to your project directory and try again`);
    return false;
  }
  
  // Show context before dangerous operations
  if (operation.includes('push') || operation.includes('flow')) {
    console.log(`🔍 Repository Context Check:`);
    showRepoContext();
    console.log(''); // blank line
  }
  
  return true;
}

/**
 * Standard help header
 */
function showHelp(command, description, usage, examples = []) {
  console.log(`
🚀 ${command} - ${description}

Usage:
${usage}

Examples:
${examples.map(ex => `  ${ex}`).join('\n')}

💡 This command respects your current working directory and repository.
`);
}

export default {
  getRepoInfo,
  showRepoContext,
  validateRepository,
  showHelp
};
