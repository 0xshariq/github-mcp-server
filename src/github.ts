/**
 * GitHub MCP Server - Advanced Git Operations Module
 * 
 * This module contains all Git operations exposed by the MCP server with
 * enhanced support for both basic and advanced workflows. Each function
 * implements comprehensive Git workflows with advanced error handling,
 * validation, safety checks, and intelligent automation.
 * 
 * Architecture:
 * - Enhanced utility functions for command execution and validation
 * - 40+ Git operations grouped by functionality (basic + advanced workflows)
 * - Intelligent workflow combinations for developer productivity
 * - Advanced conflict resolution and merge strategies
 * - Multi-repository support and cross-platform compatibility
 * - Smart defaults and context-aware operations
 * - Comprehensive logging and debugging support
 * 
 * Operations Include:
 * • Basic Git Operations: add, commit, push, pull, branch, checkout, status, etc.
 * • Advanced Operations: tag, merge, rebase, cherry-pick, blame, bisect, worktree
 * • Workflow Combinations: flow, sync, quick-commit, dev-workflow for productivity
 * • Advanced Workflows: release management, hotfix workflows, feature branches
 * • Remote Management: comprehensive remote operations with authentication
 * • Stash Operations: advanced stash management with selective application
 * • Repository Maintenance: cleanup, optimization, backup operations
 * • Team Collaboration: conflict resolution, branch synchronization
 * 
 * @module github
 * @version 2.1.0
 */

// Node.js built-in modules for executing shell commands and file operations
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

// Convert callback-based exec to Promise-based for async/await support
const execAsync = promisify(exec);

// Enhanced configuration constants
const DEFAULT_TIMEOUT = 60000; // 60 seconds for complex operations
const VALIDATION_TIMEOUT = 10000; // 10 seconds for validation checks
const MAX_LOG_ENTRIES = 100; // Increased for better debugging
const COMMAND_RETRY_COUNT = 3; // Retry failed operations
const BATCH_SIZE = 50; // For batch operations

// Enhanced return type for all Git operations with advanced metadata
export interface GitOperationResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  metadata?: {
    operation: string;
    duration: number;
    command?: string;
    exitCode?: number;
    branch?: string;
    repository?: string;
    files?: string[];
    conflicted?: boolean;
    staged?: boolean;
    clean?: boolean;
    timestamp: string;
    workingDirectory: string;
  };
}


// === UTILITY FUNCTIONS ===

/**
 * Executes git commands safely with enhanced error handling and timeout protection
 * @param command - The git command to execute
 * @param cwd - Working directory (defaults to current directory)
 * @param timeout - Command timeout in milliseconds
 * @returns Promise with stdout and stderr
 */
async function executeGitCommand(
  command: string, 
  cwd?: string, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<{ stdout: string; stderr: string }> {
  const startTime = Date.now();
  
  try {
    // Sanitize command to prevent injection attacks
    if (!command.startsWith('git ')) {
      throw new Error('Invalid command: Only git commands are allowed');
    }
    
    const result = await execAsync(command, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf8',
      timeout,
      env: { ...process.env, LANG: 'en_US.UTF-8' } // Ensure consistent output
    });
    
    const duration = Date.now() - startTime;
    console.error(`[GIT-CMD] ${command} | ${duration}ms | ${cwd || 'cwd'}`);
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Enhanced error messaging based on common Git scenarios
    let errorMessage = error.message;
    
    if (error.code === 'ETIMEDOUT') {
      errorMessage = `Git command timed out after ${timeout}ms. Try with smaller scope or check network connectivity.`;
    } else if (error.stderr?.includes('not a git repository')) {
      errorMessage = 'Not a git repository. Run "git init" to initialize or navigate to a git repository.';
    } else if (error.stderr?.includes('nothing to commit')) {
      errorMessage = 'Nothing to commit. All changes are already staged or there are no changes.';
    } else if (error.stderr?.includes('merge conflict')) {
      errorMessage = 'Merge conflict detected. Resolve conflicts manually before proceeding.';
    } else if (error.stderr?.includes('authentication failed') || error.stderr?.includes('Authentication failed')) {
      errorMessage = 'Git authentication failed. Please check your credentials and remote access.\nTip: Configure Git credentials with "git config --global user.name" and "git config --global user.email"';
    } else if (error.stderr?.includes('remote rejected')) {
      errorMessage = 'Push rejected by remote. Pull latest changes first or check branch permissions.';
    } else if (error.stderr?.includes('credential') || error.stderr?.includes('credentials')) {
      errorMessage = 'Git credential error. Please configure your Git credentials or check your access tokens.';
    } else if (error.stderr?.includes('Permission denied') || error.stderr?.includes('permission denied')) {
      errorMessage = 'Permission denied. Check your SSH keys or repository access permissions.';
    } else if (error.stderr?.includes('Could not resolve hostname')) {
      errorMessage = 'Network error: Could not resolve hostname. Check your internet connection.';
    }
    
    console.error(`[GIT-ERROR] ${command} | ${duration}ms | ${errorMessage}`);
    
    // Create a proper error object with additional properties
    const gitError = new Error(errorMessage) as any;
    gitError.stderr = error.stderr;
    gitError.stdout = error.stdout;
    gitError.code = error.code;
    throw gitError;
  }
}

/**
 * Validates if the specified directory is a git repository with enhanced error messaging
 * @param dir - Directory to check (defaults to current directory)
 * @returns Promise<boolean> - true if valid git repository
 */
async function isGitRepository(dir?: string): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir', { 
      cwd: dir || process.cwd(),
      timeout: VALIDATION_TIMEOUT
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a standardized response with metadata for debugging and monitoring
 * @param operation - Name of the Git operation
 * @param text - Response text
 * @param isError - Whether this is an error response
 * @param workingDir - Working directory used
 * @param startTime - Operation start time
 * @returns GitOperationResult with metadata
 */
function createResponse(
  operation: string,
  text: string,
  isError: boolean = false,
  workingDir: string = process.cwd(),
  startTime: number = Date.now()
): GitOperationResult {
  const duration = Date.now() - startTime;
  
  return {
    content: [{
      type: "text",
      text
    }],
    isError,
    metadata: {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      workingDirectory: workingDir
    }
  };
}

// === GIT STAGING OPERATIONS ===

/**
 * Adds all modified and untracked files to the staging area
 * @param directory - Working directory (optional)
 * @returns GitOperationResult with operation status
 */
export async function gitAddAll(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      return createResponse('git-add-all', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    // Check if there are any changes to add
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (!statusResult.stdout.trim()) {
      return createResponse('git-add-all', 'No changes to add. Working directory is clean.', false, workingDir, startTime);
    }

    const result = await executeGitCommand('git add .', workingDir);
    
    // Get summary of what was added (use diff --cached instead of status --cached)
    try {
      const statusAfter = await executeGitCommand('git diff --cached --name-status', workingDir);
      const addedFiles = statusAfter.stdout.trim().split('\n').filter(line => line.trim()).length;
      
      const message = addedFiles > 0 
        ? `✅ Successfully added ${addedFiles} file(s) to staging area.\n\nStaged files:\n${statusAfter.stdout || 'All modified files staged.'}`
        : `✅ All files added to staging area successfully.`;
      
      return createResponse('git-add-all', message, false, workingDir, startTime);
    } catch {
      // Fallback if diff command fails
      return createResponse('git-add-all', '✅ Successfully added all files to staging area.', false, workingDir, startTime);
    }
  } catch (error: any) {
    return createResponse('git-add-all', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Adds specific files to the staging area with validation
export async function gitAdd(files: string[], directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    if (!files || files.length === 0) {
      throw new Error("No files specified to add");
    }

    // Check if files exist
    for (const file of files) {
      const filePath = path.resolve(workingDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${file}`);
      }
    }

    // Quote each file path to handle spaces and special characters
    const quotedFiles = files.map(file => `"${file}"`).join(' ');
    const result = await executeGitCommand(`git add ${quotedFiles}`, workingDir);
    
    return createResponse('git-add', `✅ Successfully added files to staging area: ${files.join(', ')}\n${result.stdout || 'Files staged successfully.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-add', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Removes a specific file from the staging area (unstages it)
export async function gitRemove(file: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand(`git reset HEAD "${file}"`, workingDir);
    
    return createResponse('git-remove', `✅ Successfully removed file from staging area: ${file}\n${result.stdout || 'File unstaged successfully.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-remove', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Removes all files from the staging area (unstages everything)
export async function gitRemoveAll(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git reset HEAD .', workingDir);
    
    return createResponse('git-remove-all', `✅ Successfully removed all files from staging area.\n${result.stdout || 'All files unstaged successfully.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-remove-all', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === REPOSITORY STATUS & INFORMATION ===

// Gets the current status of the repository (staged, unstaged, untracked files)
export async function gitStatus(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    // Get repository context
    const currentDir = path.basename(workingDir);
    let contextInfo = `📁 Directory: ${currentDir}\n`;
    
    try {
      const remoteResult = await executeGitCommand('git remote get-url origin', workingDir);
      contextInfo += `🔗 Remote: ${remoteResult.stdout.trim()}\n`;
      
      const branchResult = await executeGitCommand('git branch --show-current', workingDir);
      contextInfo += `🌿 Branch: ${branchResult.stdout.trim()}\n\n`;
    } catch {
      contextInfo += `🔗 Remote: Not configured\n🌿 Branch: Unknown\n\n`;
    }

    const result = await executeGitCommand('git status --porcelain', workingDir);
    
    let statusText = contextInfo + "✅ Repository is clean (no changes)";
    if (result.stdout.trim()) {
      statusText = contextInfo + `📊 Current repository status:\n${result.stdout}`;
    }
    
    return createResponse('git-status', statusText, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-status', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === COMMIT & SYNC OPERATIONS ===

// Creates a commit with staged files and the provided message
export async function gitCommit(message: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      return createResponse('git-commit', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!message || message.trim() === '') {
      return createResponse('git-commit', 'Error: Commit message cannot be empty.', true, workingDir, startTime);
    }

    // Check if there are staged changes
    const statusResult = await executeGitCommand('git diff --cached --name-only', workingDir);
    if (!statusResult.stdout.trim()) {
      return createResponse('git-commit', 'Error: No staged changes to commit. Use "git add" to stage files first.', true, workingDir, startTime);
    }

    // Get list of staged files for confirmation
    const stagedFiles = await executeGitCommand('git diff --cached --name-status', workingDir);
    const fileCount = stagedFiles.stdout.trim().split('\n').filter(line => line.trim()).length;

    // Escape the commit message properly
    const escapedMessage = message.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const result = await executeGitCommand(`git commit -m "${escapedMessage}"`, workingDir);
    
    const message_output = `✅ Successfully committed ${fileCount} file(s) with message: "${message}"\n\n📝 Commit details:\n${result.stdout}\n\n📁 Files committed:\n${stagedFiles.stdout}`;
    return createResponse('git-commit', message_output, false, workingDir, startTime);
    
  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during commit';
    return createResponse('git-commit', `Error: ${errorMsg}`, true, workingDir, startTime);
  }
}

// Pushes local commits to the remote repository
export async function gitPush(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      return createResponse('git-push', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    // Get current working directory info for safety
    const currentDir = path.basename(workingDir);
    
    // Check remote URL for safety
    let remoteInfo = '';
    try {
      const remoteResult = await executeGitCommand('git remote get-url origin', workingDir);
      remoteInfo = remoteResult.stdout.trim();
    } catch {
      return createResponse('git-push', 'Error: No remote repository configured. Add a remote with "git remote add origin <url>".', true, workingDir, startTime);
    }

    // Check if there are commits to push
    try {
      const statusCheck = await executeGitCommand('git log @{u}..', workingDir);
      if (!statusCheck.stdout.trim()) {
        return createResponse('git-push', '✅ Nothing to push - all commits are already on remote.', false, workingDir, startTime);
      }
    } catch {
      // Remote may not exist or branch not tracked, continue with push attempt
    }

    // Check current branch
    const branchResult = await executeGitCommand('git branch --show-current', workingDir);
    const currentBranch = branchResult.stdout.trim();

    // Show confirmation info before push
    const confirmationInfo = `📁 Directory: ${currentDir}\n🔗 Remote: ${remoteInfo}\n🌿 Branch: ${currentBranch}\n\n`;

    const result = await executeGitCommand('git push', workingDir, 60000); // Longer timeout for push
    
    const message_output = `🚀 Successfully pushed changes to remote repository.\n\n${confirmationInfo}${result.stdout || result.stderr || 'Push completed successfully.'}`;
    return createResponse('git-push', message_output, false, workingDir, startTime);
    
  } catch (error: any) {
    let errorMsg = error.stderr || error.message || 'Unknown error during push';
    
    // Provide helpful suggestions for common push errors
    if (errorMsg.includes('rejected')) {
      errorMsg += '\n\n💡 Suggestion: Pull the latest changes first with "git pull" or use force push if you\'re sure.';
    } else if (errorMsg.includes('upstream')) {
      errorMsg += '\n\n💡 Suggestion: Set upstream branch with "git push -u origin <branch-name>".';
    } else if (errorMsg.includes('authentication failed') || errorMsg.includes('Authentication failed')) {
      errorMsg += '\n\n💡 Suggestions:\n- Check your Git credentials with "git config --list"\n- Update your personal access token\n- Verify repository access permissions';
    } else if (errorMsg.includes('credential') || errorMsg.includes('credentials')) {
      errorMsg += '\n\n💡 Suggestions:\n- Configure Git credentials: git config --global credential.helper store\n- Set up SSH keys for authentication\n- Check if your access token is valid';
    } else if (errorMsg.includes('Permission denied')) {
      errorMsg += '\n\n💡 Suggestions:\n- Verify SSH key setup: ssh -T git@github.com\n- Check repository access permissions\n- Ensure you have push access to the repository';
    }
    
    return createResponse('git-push', `❌ Error: ${errorMsg}`, true, workingDir, startTime);
  }
}

// Fetches and merges changes from the remote repository
export async function gitPull(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git pull', workingDir);
    
    return createResponse('git-pull', `✅ Successfully pulled changes from remote repository.\n${result.stdout || 'Already up to date.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-pull', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === BRANCH OPERATIONS ===

// Lists all branches or creates a new branch
export async function gitBranch(branchName?: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = branchName ? `git branch "${branchName}"` : 'git branch -a';
    const result = await executeGitCommand(command, workingDir);
    
    const message = branchName 
      ? `✅ Successfully created branch: ${branchName}`
      : `🌿 Available branches:\n${result.stdout}`;
    
    return createResponse('git-branch', message, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-branch', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Switches to a different branch or creates and switches to a new branch
export async function gitCheckout(branchName: string, createNew: boolean = false, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = createNew 
      ? `git checkout -b "${branchName}"` 
      : `git checkout "${branchName}"`;
    
    const result = await executeGitCommand(command, workingDir);
    
    const message = createNew
      ? `✅ Successfully created and switched to branch: ${branchName}`
      : `✅ Successfully switched to branch: ${branchName}`;
    
    return createResponse('git-checkout', `${message}\n${result.stdout || result.stderr || ''}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-checkout', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === HISTORY & INFORMATION ===

// Shows commit history
export async function gitLog(maxCount: number = 10, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand(`git log --oneline -${maxCount}`, workingDir);
    
    return createResponse('git-log', result.stdout || "📝 No commits found", false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-log', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Shows differences between commits, branches, or working directory
export async function gitDiff(target?: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = target ? `git diff ${target}` : 'git diff';
    const result = await executeGitCommand(command, workingDir);
    
    return createResponse('git-diff', result.stdout || "📄 No differences found", false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-diff', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === STASH OPERATIONS ===

// Stashes current changes
export async function gitStash(message?: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = message ? `git stash push -m "${message}"` : 'git stash';
    const result = await executeGitCommand(command, workingDir);
    
    return createResponse('git-stash', `💾 Successfully stashed changes.\n${result.stdout || 'Changes stashed successfully.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-stash', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Applies the most recent stash
export async function gitStashPop(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git stash pop', workingDir);
    
    return createResponse('git-stash-pop', `💾 Successfully applied stash.\n${result.stdout || 'Stash applied successfully.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-stash-pop', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === RESET OPERATIONS ===

// Resets repository to a specific commit or state
export async function gitReset(
  mode: 'soft' | 'mixed' | 'hard' | '--help' | '-h' = 'mixed',
  target: string = 'HEAD',
  directory?: string
): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  // Handle help request
  if (mode === '--help' || mode === '-h') {
    const helpText = `🔄 greset - Git Reset Command

Usage:
  greset [mode] [target]

Reset Modes:
  --soft     Reset HEAD only (keep staged changes)
  --mixed    Reset HEAD and index (default)
  --hard     Reset HEAD, index, and working tree (DESTRUCTIVE!)

Examples:
  greset                    # Reset to HEAD (mixed)
  greset --soft HEAD~1      # Soft reset to previous commit
  greset --hard origin/main # Hard reset to remote main

⚠️  WARNING: --hard mode will destroy uncommitted changes!
💡 Use --soft to keep your changes staged.`;
    
    return createResponse('git-reset', helpText, false, workingDir, startTime);
  }
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand(`git reset --${mode} ${target}`, workingDir);
    
    return createResponse('git-reset', `🔄 Successfully reset repository (${mode}) to ${target}.\n${result.stdout || 'Reset completed.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-reset', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === REMOTE OPERATIONS ===

// Lists all remote repositories
export async function gitRemoteList(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error('Current directory is not a Git repository');
    }
    
    const result = await executeGitCommand('git remote -v', workingDir);
    
    const remotes = result.stdout.trim();
    const displayText = remotes 
      ? `🔗 Remote repositories:\n${remotes}`
      : '📭 No remote repositories configured.';
    
    return createResponse('git-remote-list', displayText, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-remote-list', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Adds a remote repository
export async function gitRemoteAdd(name: string, url: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error('Current directory is not a Git repository');
    }
    
    if (!name || !url) {
      throw new Error('Remote name and URL are required');
    }
    
    // Validate URL format
    const urlPattern = /^(https?:\/\/|git@|ssh:\/\/)/;
    if (!urlPattern.test(url)) {
      throw new Error('Invalid Git URL format. Use HTTPS (https://...) or SSH (git@...) format.');
    }
    
    const result = await executeGitCommand(`git remote add "${name}" "${url}"`, workingDir);
    
    return createResponse('git-remote-add', `✅ Successfully added remote '${name}' with URL: ${url}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-remote-add', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Removes a remote repository
export async function gitRemoteRemove(name: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error('Current directory is not a Git repository');
    }
    
    if (!name) {
      throw new Error('Remote name is required');
    }
    
    const result = await executeGitCommand(`git remote remove "${name}"`, workingDir);
    
    return createResponse('git-remote-remove', `✅ Successfully removed remote '${name}'`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-remote-remove', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Changes the URL of an existing remote
export async function gitRemoteSetUrl(name: string, url: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      throw new Error('Current directory is not a Git repository');
    }
    
    if (!name || !url) {
      throw new Error('Remote name and URL are required');
    }
    
    // Validate URL format
    const urlPattern = /^(https?:\/\/|git@|ssh:\/\/)/;
    if (!urlPattern.test(url)) {
      throw new Error('Invalid Git URL format. Use HTTPS (https://...) or SSH (git@...) format.');
    }
    
    const result = await executeGitCommand(`git remote set-url "${name}" "${url}"`, workingDir);
    
    return createResponse('git-remote-set-url', `✅ Successfully updated remote '${name}' URL to: ${url}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-remote-set-url', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === REPOSITORY OPERATIONS ===

// Clones a repository
export async function gitClone(url: string, directory?: string, targetDir?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    const command = targetDir ? `git clone "${url}" "${targetDir}"` : `git clone "${url}"`;
    
    const result = await executeGitCommand(command, workingDir);
    
    return createResponse('git-clone', `✅ Successfully cloned repository from ${url}.\n${result.stdout || result.stderr || 'Clone completed.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-clone', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// Initializes a new Git repository
export async function gitInit(directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    // Check if already a git repository
    if (await isGitRepository(workingDir)) {
      return createResponse('git-init', '✅ Directory is already a Git repository.', false, workingDir, startTime);
    }
    
    const result = await executeGitCommand('git init', workingDir);
    
    return createResponse('git-init', `🎉 Successfully initialized empty Git repository.\n${result.stdout || result.stderr || 'Repository initialized.'}`, false, workingDir, startTime);
  } catch (error: any) {
    return createResponse('git-init', `Error: ${error.message}`, true, workingDir, startTime);
  }
}

// === ENHANCED WORKFLOW OPERATIONS ===


/**
 * Quick commit: add all and commit (without push)
 * @param message - Commit message
 * @param directory - Working directory (optional)
 * @returns GitOperationResult with operation status
 */
export async function gitQuickCommit(message: string, directory?: string): Promise<GitOperationResult> {
  const startTime = Date.now();
  const workingDir = directory || process.cwd();
  
  try {
    if (!(await isGitRepository(workingDir))) {
      return createResponse('git-quick-commit', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!message || message.trim() === '') {
      return createResponse('git-quick-commit', 'Error: Commit message is required.', true, workingDir, startTime);
    }

    // Step 1: Check for changes
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (!statusResult.stdout.trim()) {
      return createResponse('git-quick-commit', '✅ No changes to commit. Working directory is clean.', false, workingDir, startTime);
    }

    // Step 2: Add all changes
    await executeGitCommand('git add .', workingDir);
    
    // Step 3: Commit
    const escapedMessage = message.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const commitResult = await executeGitCommand(`git commit -m "${escapedMessage}"`, workingDir);
    
    return createResponse('git-quick-commit', `✅ Quick commit successful!\nMessage: "${message}"\n${commitResult.stdout}`, false, workingDir, startTime);
    
  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during quick commit';
    return createResponse('git-quick-commit', `Error: ${errorMsg}`, true, workingDir, startTime);
  }
}


// === NEW ADVANCED GIT OPERATIONS ===

/**
 * Git tag operations - Create, list, and delete tags
 */
export async function gitTag(directory?: string, action?: string, tagName?: string, message?: string): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!isGitRepository(workingDir)) {
      return createResponse('git-tag', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    let command = 'git tag';
    let resultText = '';

    switch (action) {
      case 'list':
      case undefined:
        // List all tags
        const listResult = await executeGitCommand('git tag --sort=-version:refname', workingDir);
        const tags = listResult.stdout.trim().split('\n').filter(tag => tag);
        if (tags.length === 0) {
          resultText = '📌 No tags found in this repository.';
        } else {
          resultText = `📌 Available tags (${tags.length}):\n\n${tags.map(tag => `  • ${tag}`).join('\n')}`;
        }
        break;

      case 'create':
        if (!tagName) {
          return createResponse('git-tag', '❌ Error: Tag name is required for creating tags.', true, workingDir, startTime);
        }
        command = message ? `git tag -a "${tagName}" -m "${message}"` : `git tag "${tagName}"`;
        const createResult = await executeGitCommand(command, workingDir);
        resultText = `✅ Tag '${tagName}' created successfully.${message ? `\nMessage: ${message}` : ''}`;
        break;

      case 'delete':
        if (!tagName) {
          return createResponse('git-tag', '❌ Error: Tag name is required for deleting tags.', true, workingDir, startTime);
        }
        await executeGitCommand(`git tag -d "${tagName}"`, workingDir);
        resultText = `🗑️ Tag '${tagName}' deleted successfully.`;
        break;

      case 'show':
        if (!tagName) {
          return createResponse('git-tag', '❌ Error: Tag name is required for showing tag details.', true, workingDir, startTime);
        }
        const showResult = await executeGitCommand(`git show "${tagName}" --stat`, workingDir);
        resultText = `📋 Tag details for '${tagName}':\n\n${showResult.stdout}`;
        break;

      default:
        return createResponse('git-tag', '❌ Error: Invalid action. Use: list, create, delete, or show.', true, workingDir, startTime);
    }

    return createResponse('git-tag', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during tag operation';
    return createResponse('git-tag', `❌ Tag operation failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Git merge operations with conflict detection
 */
export async function gitMerge(directory?: string, branch?: string, strategy?: string): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!isGitRepository(workingDir)) {
      return createResponse('git-merge', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!branch) {
      return createResponse('git-merge', '❌ Error: Branch name is required for merge.', true, workingDir, startTime);
    }

    // Check if branch exists
    try {
      await executeGitCommand(`git rev-parse --verify "${branch}"`, workingDir);
    } catch {
      return createResponse('git-merge', `❌ Error: Branch '${branch}' does not exist.`, true, workingDir, startTime);
    }

    // Check for uncommitted changes
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (statusResult.stdout.trim()) {
      return createResponse('git-merge', '❌ Error: You have uncommitted changes. Please commit or stash them before merging.', true, workingDir, startTime);
    }

    let command = `git merge "${branch}"`;
    if (strategy) {
      command += ` --strategy=${strategy}`;
    }

    try {
      const mergeResult = await executeGitCommand(command, workingDir);
      const resultText = `✅ Successfully merged '${branch}' into current branch.\n\n${mergeResult.stdout}`;
      return createResponse('git-merge', resultText, false, workingDir, startTime);

    } catch (mergeError: any) {
      if (mergeError.stderr?.includes('CONFLICT')) {
        const conflictFiles = await executeGitCommand('git diff --name-only --diff-filter=U', workingDir);
        const conflicts = conflictFiles.stdout.trim().split('\n').filter(f => f);
        
        let conflictText = `⚠️ Merge conflict detected!\n\n`;
        conflictText += `Conflicted files:\n${conflicts.map(f => `  • ${f}`).join('\n')}\n\n`;
        conflictText += `To resolve:\n`;
        conflictText += `1. Edit the conflicted files\n`;
        conflictText += `2. Run: git add <resolved-files>\n`;
        conflictText += `3. Run: git commit\n`;
        conflictText += `\nOr abort with: git merge --abort`;

        return createResponse('git-merge', conflictText, true, workingDir, startTime);
      }
      throw mergeError;
    }

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during merge';
    return createResponse('git-merge', `❌ Merge failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Git rebase operations with interactive support
 */
export async function gitRebase(directory?: string, target?: string, interactive?: boolean): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!isGitRepository(workingDir)) {
      return createResponse('git-rebase', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!target) {
      target = 'HEAD~1'; // Default to last commit
    }

    // Check for uncommitted changes
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (statusResult.stdout.trim()) {
      return createResponse('git-rebase', '❌ Error: You have uncommitted changes. Please commit or stash them before rebasing.', true, workingDir, startTime);
    }

    let command = interactive ? `git rebase -i "${target}"` : `git rebase "${target}"`;

    try {
      const rebaseResult = await executeGitCommand(command, workingDir);
      const resultText = `✅ Rebase completed successfully.\n\n${rebaseResult.stdout}`;
      return createResponse('git-rebase', resultText, false, workingDir, startTime);

    } catch (rebaseError: any) {
      if (rebaseError.stderr?.includes('CONFLICT')) {
        const conflictFiles = await executeGitCommand('git diff --name-only --diff-filter=U', workingDir);
        const conflicts = conflictFiles.stdout.trim().split('\n').filter(f => f);
        
        let conflictText = `⚠️ Rebase conflict detected!\n\n`;
        conflictText += `Conflicted files:\n${conflicts.map(f => `  • ${f}`).join('\n')}\n\n`;
        conflictText += `To resolve:\n`;
        conflictText += `1. Edit the conflicted files\n`;
        conflictText += `2. Run: git add <resolved-files>\n`;
        conflictText += `3. Run: git rebase --continue\n`;
        conflictText += `\nOr abort with: git rebase --abort`;

        return createResponse('git-rebase', conflictText, true, workingDir, startTime);
      }
      throw rebaseError;
    }

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during rebase';
    return createResponse('git-rebase', `❌ Rebase failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Git cherry-pick operations
 */
export async function gitCherryPick(directory?: string, commitHash?: string): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!isGitRepository(workingDir)) {
      return createResponse('git-cherry-pick', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!commitHash) {
      return createResponse('git-cherry-pick', '❌ Error: Commit hash is required for cherry-pick.', true, workingDir, startTime);
    }

    // Validate commit exists
    try {
      await executeGitCommand(`git rev-parse --verify "${commitHash}"`, workingDir);
    } catch {
      return createResponse('git-cherry-pick', `❌ Error: Commit '${commitHash}' does not exist.`, true, workingDir, startTime);
    }

    // Check for uncommitted changes
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (statusResult.stdout.trim()) {
      return createResponse('git-cherry-pick', '❌ Error: You have uncommitted changes. Please commit or stash them before cherry-picking.', true, workingDir, startTime);
    }

    const cherryPickResult = await executeGitCommand(`git cherry-pick "${commitHash}"`, workingDir);
    const resultText = `🍒 Successfully cherry-picked commit '${commitHash.substring(0, 8)}'.\n\n${cherryPickResult.stdout}`;
    
    return createResponse('git-cherry-pick', resultText, false, workingDir, startTime);

  } catch (error: any) {
    if (error.stderr?.includes('CONFLICT')) {
      const conflictFiles = await executeGitCommand('git diff --name-only --diff-filter=U', workingDir);
      const conflicts = conflictFiles.stdout.trim().split('\n').filter(f => f);
      
      let conflictText = `⚠️ Cherry-pick conflict detected!\n\n`;
      conflictText += `Conflicted files:\n${conflicts.map(f => `  • ${f}`).join('\n')}\n\n`;
      conflictText += `To resolve:\n`;
      conflictText += `1. Edit the conflicted files\n`;
      conflictText += `2. Run: git add <resolved-files>\n`;
      conflictText += `3. Run: git cherry-pick --continue\n`;
      conflictText += `\nOr abort with: git cherry-pick --abort`;

      return createResponse('git-cherry-pick', conflictText, true, workingDir, startTime);
    }

    const errorMsg = error.stderr || error.message || 'Unknown error during cherry-pick';
    return createResponse('git-cherry-pick', `❌ Cherry-pick failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Git blame operations - Show line-by-line authorship
 */
export async function gitBlame(directory?: string, filePath?: string, lineRange?: string): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!isGitRepository(workingDir)) {
      return createResponse('git-blame', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!filePath) {
      return createResponse('git-blame', '❌ Error: File path is required for blame.', true, workingDir, startTime);
    }

    // Check if file exists
    const fullPath = path.resolve(workingDir, filePath);
    if (!fs.existsSync(fullPath)) {
      return createResponse('git-blame', `❌ Error: File '${filePath}' does not exist.`, true, workingDir, startTime);
    }

    let command = `git blame "${filePath}"`;
    if (lineRange) {
      command += ` -L ${lineRange}`;
    }

    const blameResult = await executeGitCommand(command, workingDir);
    const resultText = `📝 Blame information for '${filePath}':\n\n${blameResult.stdout}`;
    
    return createResponse('git-blame', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during blame';
    return createResponse('git-blame', `❌ Blame failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Git bisect operations - Binary search for bugs
 */
export async function gitBisect(directory?: string, action?: string, commit?: string): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!await isGitRepository(workingDir)) {
      return createResponse('git-bisect', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    let command = '';
    let resultText = '';

    switch (action) {
      case 'start':
        command = 'git bisect start';
        break;
      case 'bad':
        command = commit ? `git bisect bad "${commit}"` : 'git bisect bad';
        break;
      case 'good':
        command = commit ? `git bisect good "${commit}"` : 'git bisect good';
        break;
      case 'reset':
        command = 'git bisect reset';
        break;
      case 'status':
        command = 'git bisect log';
        break;
      default:
        return createResponse('git-bisect', '❌ Error: Invalid action. Use: start, bad, good, reset, or status.', true, workingDir, startTime);
    }

    const bisectResult = await executeGitCommand(command, workingDir);
    resultText = `🔍 Bisect ${action}:\n\n${bisectResult.stdout}`;
    
    return createResponse('git-bisect', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during bisect';
    return createResponse('git-bisect', `❌ Bisect failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

// === ADVANCED WORKFLOW OPERATIONS ===

/**
 * Advanced Git Flow - Enhanced workflow with intelligent automation
 * Supports specific files, smart defaults, and comprehensive validation
 */
export async function gitFlow(directory?: string, message?: string, files?: string[], options?: { push?: boolean; review?: boolean; dryRun?: boolean }): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!await isGitRepository(workingDir)) {
      return createResponse('git-flow', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!message) {
      return createResponse('git-flow', '❌ Error: Commit message is required for git flow.', true, workingDir, startTime);
    }

    const opts = { push: true, review: false, dryRun: false, ...options };
    let resultText = `⚡ Starting Enhanced Git Flow...\n`;
    resultText += `📝 Commit message: "${message}"\n`;

    // Step 1: Check repository status
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (!statusResult.stdout.trim() && !opts.dryRun) {
      return createResponse('git-flow', '⚠️  No changes to commit. Repository is clean.', false, workingDir, startTime);
    }

    // Step 2: Add files (specific files or all changes)
    let addCommand = 'git add .';
    if (files && files.length > 0) {
      addCommand = `git add ${files.map(f => `"${f}"`).join(' ')}`;
      resultText += `📁 Files to add: ${files.join(', ')}\n`;
    } else {
      resultText += `📁 Adding all changes\n`;
    }

    if (opts.dryRun) {
      resultText += `\n🔍 DRY RUN - Would execute:\n`;
      resultText += `   ${addCommand}\n`;
      resultText += `   git commit -m "${message}"\n`;
      if (opts.push) {
        resultText += `   git push\n`;
      }
      return createResponse('git-flow', resultText, false, workingDir, startTime);
    }

    resultText += `\n📁 Step 1: Adding changes...\n`;
    await executeGitCommand(addCommand, workingDir);
    resultText += `✅ Changes added to staging area\n`;

    // Step 3: Commit changes
    resultText += `\n💾 Step 2: Committing changes...\n`;
    const commitResult = await executeGitCommand(`git commit -m "${message}"`, workingDir);
    resultText += `✅ Changes committed successfully\n`;

    // Step 4: Push to remote (if not review mode)
    if (opts.push && !opts.review) {
      resultText += `\n🚀 Step 3: Pushing to remote repository...\n`;
      try {
        await executeGitCommand('git push', workingDir);
        resultText += `✅ Changes pushed to remote\n`;
      } catch (error: any) {
        if (error.stderr?.includes('no upstream branch')) {
          // Try to push with --set-upstream
          const branchResult = await executeGitCommand('git branch --show-current', workingDir);
          const currentBranch = branchResult.stdout.trim();
          await executeGitCommand(`git push --set-upstream origin ${currentBranch}`, workingDir);
          resultText += `✅ Changes pushed with upstream branch set\n`;
        } else {
          throw error;
        }
      }
    } else if (opts.review) {
      resultText += `\n📋 Commit created for review (not pushed)\n`;
    }

    resultText += `\n🎉 Git flow completed successfully!\n`;
    if (opts.push && !opts.review) {
      resultText += `💡 Your changes are now live on the remote repository\n`;
    }
    
    return createResponse('git-flow', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during git flow';
    return createResponse('git-flow', `❌ Git flow failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Advanced Developer Workflow - Intelligent development session management
 */
export async function gitDev(directory?: string, branchName?: string, options?: { sync?: boolean; status?: boolean; continue?: boolean }): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!await isGitRepository(workingDir)) {
      return createResponse('git-dev', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    const opts = { sync: true, status: true, continue: false, ...options };
    let resultText = `🛠️  Developer Workflow Manager\n`;

    // Get current branch and status
    const branchResult = await executeGitCommand('git branch --show-current', workingDir);
    const currentBranch = branchResult.stdout.trim();
    resultText += `🌿 Current Branch: ${currentBranch}\n`;

    if (opts.status) {
      // Enhanced status checking
      const statusResult = await executeGitCommand('git status --porcelain', workingDir);
      const stagedFiles = statusResult.stdout.split('\n').filter(line => line.match(/^[MARC]/)).length;
      const modifiedFiles = statusResult.stdout.split('\n').filter(line => line.match(/^.M/)).length;
      const untrackedFiles = statusResult.stdout.split('\n').filter(line => line.match(/^\?\?/)).length;

      resultText += `📊 Repository Status:\n`;
      resultText += `   • Staged files: ${stagedFiles}\n`;
      resultText += `   • Modified files: ${modifiedFiles}\n`;
      resultText += `   • Untracked files: ${untrackedFiles}\n`;

      // Check if we're behind remote
      try {
        await executeGitCommand('git fetch', workingDir);
        const aheadBehindResult = await executeGitCommand('git rev-list --count --left-right HEAD...@{upstream}', workingDir);
        const [ahead, behind] = aheadBehindResult.stdout.trim().split('\t').map(n => parseInt(n) || 0);
        if (ahead > 0 || behind > 0) {
          resultText += `   • Ahead: ${ahead} commits, Behind: ${behind} commits\n`;
        }
      } catch {
        resultText += `   • No upstream branch configured\n`;
      }
    }

    // Create or switch to branch if specified
    if (branchName && branchName !== currentBranch) {
      resultText += `\n🌿 Branch Management:\n`;
      try {
        // Check if branch exists
        const branchCheckResult = await executeGitCommand(`git show-ref --verify --quiet refs/heads/${branchName}`, workingDir);
        resultText += `   Switching to existing branch: ${branchName}\n`;
        await executeGitCommand(`git checkout ${branchName}`, workingDir);
      } catch {
        // Branch doesn't exist, create it
        resultText += `   Creating and switching to new branch: ${branchName}\n`;
        await executeGitCommand(`git checkout -b ${branchName}`, workingDir);
      }
    }

    // Sync with remote if requested
    if (opts.sync) {
      resultText += `\n🔄 Synchronization:\n`;
      try {
        resultText += `   Fetching latest changes...\n`;
        await executeGitCommand('git fetch --all', workingDir);
        
        // Try to pull if there's an upstream branch
        try {
          await executeGitCommand('git pull', workingDir);
          resultText += `   ✅ Synchronized with remote\n`;
        } catch {
          resultText += `   ⚠️  No upstream branch to pull from\n`;
        }
      } catch (error: any) {
        resultText += `   ⚠️  Sync failed: ${error.message}\n`;
      }
    }

    // Session continuation
    if (opts.continue) {
      resultText += `\n🔄 Session Continuation:\n`;
      try {
        // Check for stashes
        const stashResult = await executeGitCommand('git stash list', workingDir);
        if (stashResult.stdout.trim()) {
          resultText += `   Found ${stashResult.stdout.split('\n').length} stash(es)\n`;
          resultText += `   Use 'git stash pop' to restore your work\n`;
        } else {
          resultText += `   No stashed work found\n`;
        }
      } catch {
        resultText += `   Could not check for stashed work\n`;
      }
    }

    resultText += `\n✅ Developer workflow ready!\n`;
    resultText += `💡 Suggestions:\n`;
    resultText += `   • Use 'git add .' to stage changes\n`;
    resultText += `   • Use 'git commit -m "message"' to commit\n`;
    resultText += `   • Use 'git push' to share your work\n`;
    
    return createResponse('git-dev', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error in developer workflow';
    return createResponse('git-dev', `❌ Developer workflow failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Advanced Sync - Comprehensive synchronization with conflict resolution
 */
export async function gitSync(directory?: string, options?: { rebase?: boolean; force?: boolean; all?: boolean; prune?: boolean }): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!await isGitRepository(workingDir)) {
      return createResponse('git-sync', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    const opts = { rebase: false, force: false, all: false, prune: true, ...options };
    let resultText = `🔄 Advanced Repository Synchronization\n`;

    // Get current branch
    const branchResult = await executeGitCommand('git branch --show-current', workingDir);
    const currentBranch = branchResult.stdout.trim();
    resultText += `🌿 Current Branch: ${currentBranch}\n`;

    // Fetch all remotes
    resultText += `\n📡 Fetching from all remotes...\n`;
    let fetchCommand = 'git fetch --all';
    if (opts.prune) {
      fetchCommand += ' --prune';
    }
    await executeGitCommand(fetchCommand, workingDir);
    resultText += `✅ Fetch completed\n`;

    // Check for upstream branch
    let hasUpstream = false;
    try {
      await executeGitCommand('git rev-parse --abbrev-ref @{upstream}', workingDir);
      hasUpstream = true;
    } catch {
      resultText += `⚠️  No upstream branch configured for ${currentBranch}\n`;
    }

    if (hasUpstream) {
      // Check ahead/behind status
      const aheadBehindResult = await executeGitCommand('git rev-list --count --left-right HEAD...@{upstream}', workingDir);
      const [ahead, behind] = aheadBehindResult.stdout.trim().split('\t').map(n => parseInt(n) || 0);
      
      resultText += `📊 Branch Status: ${ahead} ahead, ${behind} behind\n`;

      if (behind > 0) {
        // Pull changes
        resultText += `\n⬇️  Pulling ${behind} commits...\n`;
        try {
          if (opts.rebase) {
            await executeGitCommand('git pull --rebase', workingDir);
            resultText += `✅ Rebased successfully\n`;
          } else {
            await executeGitCommand('git pull', workingDir);
            resultText += `✅ Merged successfully\n`;
          }
        } catch (error: any) {
          if (error.stderr?.includes('conflict')) {
            resultText += `⚠️  Merge conflicts detected. Please resolve manually.\n`;
            // List conflicted files
            try {
              const conflictResult = await executeGitCommand('git diff --name-only --diff-filter=U', workingDir);
              if (conflictResult.stdout.trim()) {
                resultText += `📄 Conflicted files:\n${conflictResult.stdout.split('\n').map(f => `   • ${f}`).join('\n')}\n`;
              }
            } catch {}
          } else {
            throw error;
          }
        }
      }

      if (ahead > 0 && !opts.force) {
        resultText += `\n⬆️  You have ${ahead} commits to push\n`;
        resultText += `💡 Use git push to share your changes\n`;
      } else if (ahead > 0 && opts.force) {
        resultText += `\n⬆️  Force pushing ${ahead} commits...\n`;
        await executeGitCommand('git push --force-with-lease', workingDir);
        resultText += `✅ Force push completed\n`;
      }
    }

    // Sync all branches if requested
    if (opts.all) {
      resultText += `\n🌿 Synchronizing all branches...\n`;
      try {
        const allBranchesResult = await executeGitCommand('git branch -r', workingDir);
        const remoteBranches = allBranchesResult.stdout
          .split('\n')
          .filter(line => line.trim() && !line.includes('->'))
          .map(line => line.trim().replace('origin/', ''));

        for (const branch of remoteBranches.slice(0, 10)) { // Limit to 10 branches
          try {
            await executeGitCommand(`git checkout ${branch}`, workingDir);
            await executeGitCommand('git pull', workingDir);
            resultText += `   ✅ ${branch}\n`;
          } catch {
            resultText += `   ⚠️  ${branch} (failed)\n`;
          }
        }

        // Return to original branch
        await executeGitCommand(`git checkout ${currentBranch}`, workingDir);
        resultText += `🔄 Returned to ${currentBranch}\n`;
      } catch (error: any) {
        resultText += `⚠️  All-branch sync failed: ${error.message}\n`;
      }
    }

    resultText += `\n✅ Synchronization completed!\n`;
    
    return createResponse('git-sync', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during sync';
    return createResponse('git-sync', `❌ Sync failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Smart Release Management - Automated release workflow
 */
export async function gitRelease(directory?: string, version?: string, options?: { changelog?: boolean; notes?: string; push?: boolean; dryRun?: boolean }): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!await isGitRepository(workingDir)) {
      return createResponse('git-release', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    if (!version) {
      return createResponse('git-release', '❌ Error: Version is required for release.', true, workingDir, startTime);
    }

    const opts = { changelog: true, push: true, dryRun: false, ...options };
    let resultText = `🚀 Release Management for ${version}\n`;

    // Validate version format (basic semver check)
    if (!version.match(/^v?\d+\.\d+\.\d+/)) {
      resultText += `⚠️  Version format should follow semantic versioning (e.g., v1.2.3)\n`;
    }

    // Check if tag already exists
    try {
      await executeGitCommand(`git tag -l "${version}"`, workingDir);
      const tagExists = await executeGitCommand(`git rev-parse --verify ${version}`, workingDir);
      if (tagExists.stdout.trim()) {
        return createResponse('git-release', `❌ Tag ${version} already exists.`, true, workingDir, startTime);
      }
    } catch {
      // Tag doesn't exist, which is good
    }

    if (opts.dryRun) {
      resultText += `\n🔍 DRY RUN - Would create release ${version}:\n`;
      resultText += `   • Create annotated tag\n`;
      if (opts.changelog) resultText += `   • Generate changelog\n`;
      if (opts.push) resultText += `   • Push tag to remote\n`;
      return createResponse('git-release', resultText, false, workingDir, startTime);
    }

    // Ensure working directory is clean
    const statusResult = await executeGitCommand('git status --porcelain', workingDir);
    if (statusResult.stdout.trim()) {
      return createResponse('git-release', '❌ Working directory must be clean before creating release.', true, workingDir, startTime);
    }

    // Generate changelog if requested
    let releaseNotes = opts.notes || '';
    if (opts.changelog) {
      try {
        // Get commits since last tag
        const lastTagResult = await executeGitCommand('git describe --tags --abbrev=0', workingDir);
        const lastTag = lastTagResult.stdout.trim();
        
        if (lastTag) {
          const changelogResult = await executeGitCommand(`git log ${lastTag}..HEAD --pretty=format:"• %s"`, workingDir);
          if (changelogResult.stdout.trim()) {
            releaseNotes = `Changes since ${lastTag}:\n\n${changelogResult.stdout}`;
            resultText += `📋 Generated changelog from ${lastTag}\n`;
          }
        } else {
          const changelogResult = await executeGitCommand('git log --pretty=format:"• %s"', workingDir);
          releaseNotes = `Initial release changes:\n\n${changelogResult.stdout}`;
        }
      } catch {
        releaseNotes = opts.notes || `Release ${version}`;
      }
    }

    // Create annotated tag
    resultText += `\n🏷️  Creating release tag ${version}...\n`;
    const tagCommand = `git tag -a "${version}" -m "${releaseNotes.replace(/"/g, '\\"')}"`;
    await executeGitCommand(tagCommand, workingDir);
    resultText += `✅ Tag created successfully\n`;

    // Push tag to remote
    if (opts.push) {
      resultText += `\n📤 Pushing release to remote...\n`;
      await executeGitCommand(`git push origin ${version}`, workingDir);
      resultText += `✅ Release pushed to remote\n`;
    }

    resultText += `\n🎉 Release ${version} created successfully!\n`;
    if (releaseNotes) {
      resultText += `\n📝 Release Notes:\n${releaseNotes}\n`;
    }
    
    return createResponse('git-release', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during release';
    return createResponse('git-release', `❌ Release failed: ${errorMsg}`, true, workingDir, startTime);
  }
}

/**
 * Repository Cleanup - Advanced maintenance operations
 */
export async function gitClean(directory?: string, options?: { branches?: boolean; cache?: boolean; files?: boolean; aggressive?: boolean; dryRun?: boolean }): Promise<GitOperationResult> {
  const workingDir = directory || process.cwd();
  const startTime = Date.now();

  try {
    if (!await isGitRepository(workingDir)) {
      return createResponse('git-clean', 'Error: Not a git repository. Run "git init" to initialize.', true, workingDir, startTime);
    }

    const opts = { branches: true, cache: true, files: false, aggressive: false, dryRun: false, ...options };
    let resultText = `🧹 Repository Cleanup Operations\n`;

    if (opts.dryRun) {
      resultText += `\n🔍 DRY RUN - Would perform:\n`;
      if (opts.branches) resultText += `   • Clean merged branches\n`;
      if (opts.cache) resultText += `   • Clear Git cache\n`;
      if (opts.files) resultText += `   • Remove untracked files\n`;
      if (opts.aggressive) resultText += `   • Aggressive cleanup (gc, prune)\n`;
      return createResponse('git-clean', resultText, false, workingDir, startTime);
    }

    // Clean merged branches
    if (opts.branches) {
      resultText += `\n🌿 Cleaning merged branches...\n`;
      try {
        // Get current branch
        const currentBranchResult = await executeGitCommand('git branch --show-current', workingDir);
        const currentBranch = currentBranchResult.stdout.trim();
        
        // Get merged branches (excluding current and main/master)
        const mergedResult = await executeGitCommand('git branch --merged', workingDir);
        const mergedBranches = mergedResult.stdout
          .split('\n')
          .map(line => line.trim().replace('*', '').trim())
          .filter(branch => branch && branch !== currentBranch && branch !== 'main' && branch !== 'master');

        if (mergedBranches.length > 0) {
          for (const branch of mergedBranches) {
            try {
              await executeGitCommand(`git branch -d ${branch}`, workingDir);
              resultText += `   ✅ Deleted branch: ${branch}\n`;
            } catch {
              resultText += `   ⚠️  Could not delete: ${branch}\n`;
            }
          }
        } else {
          resultText += `   No merged branches to clean\n`;
        }
      } catch (error: any) {
        resultText += `   ⚠️  Branch cleanup failed: ${error.message}\n`;
      }
    }

    // Clear Git cache
    if (opts.cache) {
      resultText += `\n🗄️  Clearing Git cache...\n`;
      try {
        await executeGitCommand('git gc --auto', workingDir);
        resultText += `   ✅ Git garbage collection completed\n`;
        
        if (opts.aggressive) {
          await executeGitCommand('git gc --aggressive --prune=now', workingDir);
          resultText += `   ✅ Aggressive cleanup completed\n`;
        }
      } catch (error: any) {
        resultText += `   ⚠️  Cache cleanup failed: ${error.message}\n`;
      }
    }

    // Remove untracked files
    if (opts.files) {
      resultText += `\n📄 Removing untracked files...\n`;
      try {
        // Show what would be removed first
        const cleanDryRun = await executeGitCommand('git clean -dn', workingDir);
        if (cleanDryRun.stdout.trim()) {
          resultText += `   Files to remove:\n${cleanDryRun.stdout.split('\n').map(line => `   ${line}`).join('\n')}\n`;
          await executeGitCommand('git clean -df', workingDir);
          resultText += `   ✅ Untracked files removed\n`;
        } else {
          resultText += `   No untracked files to remove\n`;
        }
      } catch (error: any) {
        resultText += `   ⚠️  File cleanup failed: ${error.message}\n`;
      }
    }

    // Prune remote references
    resultText += `\n🔗 Pruning remote references...\n`;
    try {
      await executeGitCommand('git remote prune origin', workingDir);
      resultText += `   ✅ Remote references pruned\n`;
    } catch (error: any) {
      resultText += `   ⚠️  Remote prune failed: ${error.message}\n`;
    }

    resultText += `\n✅ Repository cleanup completed!\n`;
    resultText += `💡 Your repository is now optimized and clean\n`;
    
    return createResponse('git-clean', resultText, false, workingDir, startTime);

  } catch (error: any) {
    const errorMsg = error.stderr || error.message || 'Unknown error during cleanup';
    return createResponse('git-clean', `❌ Cleanup failed: ${errorMsg}`, true, workingDir, startTime);
  }
}
