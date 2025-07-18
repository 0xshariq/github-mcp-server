import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

export interface GitOperationResult {
  [x: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

// Helper function to execute git commands safely
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

// Helper function to check if we're in a git repository
async function isGitRepository(dir?: string): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir', { cwd: dir || process.cwd() });
    return true;
  } catch {
    return false;
  }
}

// Git Add All - Adds all files to staging area
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

// Git Add - Adds a specific file to staging area
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

// Git Remove - Removes a specific file from staging area
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

// Git Remove All - Removes all files from staging area
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

// Git Status - Shows the status of the repository
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

// Git Commit - Commits staged files with a message
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

// Git Push - Pushes committed changes to remote repository
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

// Git Pull - Pulls changes from remote repository
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
