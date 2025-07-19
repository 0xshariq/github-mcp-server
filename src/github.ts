// Node.js built-in modules for executing shell commands and file operations
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

// Convert callback-based exec to Promise-based for async/await support
const execAsync = promisify(exec);

// Standard return type for all Git operations - matches MCP server expectations
export interface GitOperationResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

// === UTILITY FUNCTIONS ===

// Executes git commands safely with proper error handling and timeout
async function executeGitCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await execAsync(command, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf8',
      timeout: 30000 // 30 second timeout
    });
    return result;
  } catch (error: any) {
    // Provide more detailed error information
    const errorMessage = error.code === 'ETIMEDOUT' 
      ? 'Git command timed out after 30 seconds'
      : `Git command failed: ${error.message}`;
    throw new Error(errorMessage);
  }
}

// Validates if the specified directory is a git repository with better error messaging
async function isGitRepository(dir?: string): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir', { 
      cwd: dir || process.cwd(),
      timeout: 5000 // 5 second timeout for quick check
    });
    return true;
  } catch {
    return false;
  }
}

// === GIT STAGING OPERATIONS ===

// Adds all modified and untracked files to the staging area
export async function gitAddAll(directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git add .', workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully added all files to staging area.\n${result.stdout || 'No output from git add command.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Adds specific files to the staging area with validation
export async function gitAdd(files: string[], directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
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
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully added files to staging area: ${files.join(', ')}\n${result.stdout || 'No output from git add command.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Removes a specific file from the staging area (unstages it)
export async function gitRemove(file: string, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand(`git reset HEAD "${file}"`, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully removed file from staging area: ${file}\n${result.stdout || 'File unstaged successfully.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Removes all files from the staging area (unstages everything)
export async function gitRemoveAll(directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git reset HEAD .', workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully removed all files from staging area.\n${result.stdout || 'All files unstaged successfully.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === REPOSITORY STATUS & INFORMATION ===

// Gets the current status of the repository (staged, unstaged, untracked files)
export async function gitStatus(directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git status --porcelain', workingDir);
    
    let statusText = "Repository is clean (no changes)";
    if (result.stdout.trim()) {
      statusText = `Current repository status:\n${result.stdout}`;
    }
    
    return {
      content: [
        {
          type: "text",
          text: statusText
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === COMMIT & SYNC OPERATIONS ===

// Creates a commit with staged files and the provided message
export async function gitCommit(message: string, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    // Check if there are staged changes
    const statusResult = await executeGitCommand('git diff --cached --name-only', workingDir);
    if (!statusResult.stdout.trim()) {
      throw new Error("No staged changes to commit");
    }

    const result = await executeGitCommand(`git commit -m "${message.replace(/"/g, '\\"')}"`, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully committed with message: "${message}"\n${result.stdout}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Pushes local commits to the remote repository
export async function gitPush(directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git push', workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully pushed changes to remote repository.\n${result.stdout || result.stderr || 'Push completed successfully.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Fetches and merges changes from the remote repository
export async function gitPull(directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git pull', workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully pulled changes from remote repository.\n${result.stdout || 'Already up to date.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === BRANCH OPERATIONS ===

// Lists all branches or creates a new branch
export async function gitBranch(branchName?: string, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = branchName ? `git branch "${branchName}"` : 'git branch -a';
    const result = await executeGitCommand(command, workingDir);
    
    const message = branchName 
      ? `Successfully created branch: ${branchName}`
      : `Available branches:\n${result.stdout}`;
    
    return {
      content: [
        {
          type: "text",
          text: message
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Switches to a different branch or creates and switches to a new branch
export async function gitCheckout(branchName: string, createNew: boolean = false, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = createNew 
      ? `git checkout -b "${branchName}"` 
      : `git checkout "${branchName}"`;
    
    const result = await executeGitCommand(command, workingDir);
    
    const message = createNew
      ? `Successfully created and switched to branch: ${branchName}`
      : `Successfully switched to branch: ${branchName}`;
    
    return {
      content: [
        {
          type: "text",
          text: `${message}\n${result.stdout || result.stderr || ''}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === HISTORY & INFORMATION ===

// Shows commit history
export async function gitLog(maxCount: number = 10, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand(`git log --oneline -${maxCount}`, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: result.stdout || "No commits found"
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Shows differences between commits, branches, or working directory
export async function gitDiff(target?: string, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = target ? `git diff ${target}` : 'git diff';
    const result = await executeGitCommand(command, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: result.stdout || "No differences found"
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === STASH OPERATIONS ===

// Stashes current changes
export async function gitStash(message?: string, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const command = message ? `git stash push -m "${message}"` : 'git stash';
    const result = await executeGitCommand(command, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully stashed changes.\n${result.stdout || 'Changes stashed successfully.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Applies the most recent stash
export async function gitStashPop(directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand('git stash pop', workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully applied stash.\n${result.stdout || 'Stash applied successfully.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === RESET OPERATIONS ===

// Resets repository to a specific commit or state
export async function gitReset(mode: 'soft' | 'mixed' | 'hard' = 'mixed', target: string = 'HEAD', directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    const result = await executeGitCommand(`git reset --${mode} ${target}`, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully reset repository (${mode}) to ${target}.\n${result.stdout || 'Reset completed.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// === REPOSITORY OPERATIONS ===

// Clones a repository
export async function gitClone(url: string, directory?: string, targetDir?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    const command = targetDir ? `git clone "${url}" "${targetDir}"` : `git clone "${url}"`;
    
    const result = await executeGitCommand(command, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully cloned repository from ${url}.\n${result.stdout || result.stderr || 'Clone completed.'}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
