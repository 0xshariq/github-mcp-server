// Node.js built-in modules for executing shell commands and file operations
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

// Convert callback-based exec to Promise-based for async/await support
const execAsync = promisify(exec);

// Standard return type for all Git operations - matches MCP server expectations
export interface GitOperationResult {
  [x: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

// === UTILITY FUNCTIONS ===

// Executes git commands safely with proper error handling
async function executeGitCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await execAsync(command, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf8'
    });
    return result;
  } catch (error: any) {
    throw new Error(`Git command failed: ${error.message}`);
  }
}

// Validates if the specified directory is a git repository
async function isGitRepository(dir?: string): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir', { cwd: dir || process.cwd() });
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

// Adds a specific file to the staging area with validation
export async function gitAdd(file: string, directory?: string): Promise<GitOperationResult> {
  try {
    const workingDir = directory || process.cwd();
    
    if (!(await isGitRepository(workingDir))) {
      throw new Error("Not a git repository");
    }

    // Check if file exists
    const filePath = path.resolve(workingDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${file}`);
    }

    const result = await executeGitCommand(`git add "${file}"`, workingDir);
    
    return {
      content: [
        {
          type: "text",
          text: `Successfully added file to staging area: ${file}\n${result.stdout || 'No output from git add command.'}`
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
