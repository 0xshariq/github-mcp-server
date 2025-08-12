#!/usr/bin/env node

/**
 * GitHub MCP Server - Model Context Protocol Server for Git Operations
 * 
 * This server provides comprehensive Git repository management capabilities through the
 * Model Context Protocol (MCP). It exposes 29 Git operations as standardized tools
 * that can be used by AI assistants, CLI tools, and automation scripts.
 * 
 * Features:
 * - Complete Git workflow support (add, commit, push, pull, branch management)
 * - Advanced Git operations (tag, merge, rebase, cherry-pick, blame, bisect)
 * - Workflow combinations for enhanced developer productivity
 * - Comprehensive error handling with meaningful messages
 * - Timeout protection for long-running operations
 * - Input validation and sanitization
 * - Cross-platform compatibility
 * - Flexible directory support for multi-repository workflows
 * 
 * Operations:
 * • Core Operations: 20 essential Git commands for daily development
 * • Advanced Operations: 9 specialized commands for complex workflows
 * • Workflow Combinations: 15+ CLI aliases for enhanced productivity
 * • Developer Tools: Smart workflows, backup systems, cleanup utilities
 * 
 * @author GitHub MCP Server Team
 * @version 1.8.3
 * @license ISC
 */

// MCP (Model Context Protocol) SDK imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";


// Import Git operation functions from our github module
import {
  gitAddAll,
  gitAdd,
  gitRemove,
  gitRemoveAll,
  gitStatus,
  gitCommit,
  gitPush,
  gitPull,
  gitBranch,
  gitCheckout,
  gitLog,
  gitDiff,
  gitStash,
  gitStashPop,
  gitReset,
  gitClone,
  gitInit,
  gitRemoteList,
  gitRemoteAdd,
  gitRemoteRemove,
  gitRemoteSetUrl,
  gitFlow,
  gitQuickCommit,
  gitSync,
  gitTag,
  gitMerge,
  gitRebase,
  gitCherryPick,
  gitBlame,
  gitBisect
} from "./github.js";

// Initialize MCP server with enhanced metadata and capabilities
const server = new Server({
  name: "github-mcp-server",
  version: "1.8.0",
  description: "Comprehensive Git repository management server for AI assistants",
  author: "GitHub MCP Server Team",
  license: "ISC"
}, {
  capabilities: {
    tools: {},
    logging: {},
    experimental: {}
  }
});

// Performance and debugging utilities
const startTime = Date.now();
let operationCount = 0;

/**
 * Logs operation metrics for debugging and performance monitoring
 */
function logOperation(toolName: string, success: boolean, duration: number) {
  operationCount++;
  const uptime = Date.now() - startTime;
  console.error(`[MCP-GIT] ${toolName} | ${success ? 'SUCCESS' : 'ERROR'} | ${duration}ms | Uptime: ${uptime}ms | Ops: ${operationCount}`);
}

// === TOOL DEFINITIONS & SCHEMAS ===

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "git-add-all",
        description: "Adds all files to the staging area",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-add",
        description: "Adds a specific file to the staging area",
        inputSchema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: { type: "string" },
              description: "The files to add to the staging area"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["files"]
        }
      },
      {
        name: "git-remove",
        description: "Removes a specific file from the staging area",
        inputSchema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              description: "The file to remove from the staging area"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["file"]
        }
      },
      {
        name: "git-remove-all",
        description: "Removes all files from the staging area",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-status",
        description: "Displays the status of the git repository",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-commit",
        description: "Commits staged files",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Commit message"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["message"]
        }
      },
      {
        name: "git-push",
        description: "Pushes committed files to the remote repository",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-pull",
        description: "Pulls changes from the remote repository",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-branch",
        description: "Lists all branches or creates a new branch",
        inputSchema: {
          type: "object",
          properties: {
            branchName: {
              type: "string",
              description: "Name of the branch to create (leave empty to list branches)"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-checkout",
        description: "Switches to a branch or creates and switches to a new branch",
        inputSchema: {
          type: "object",
          properties: {
            branchName: {
              type: "string",
              description: "Name of the branch to switch to"
            },
            createNew: {
              type: "boolean",
              description: "Create a new branch if it doesn't exist (default: false)"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["branchName"]
        }
      },
      {
        name: "git-log",
        description: "Shows commit history",
        inputSchema: {
          type: "object",
          properties: {
            maxCount: {
              type: "number",
              description: "Maximum number of commits to show (default: 10)"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-diff",
        description: "Shows differences between commits, branches, or working directory",
        inputSchema: {
          type: "object",
          properties: {
            target: {
              type: "string",
              description: "Target to compare against (commit hash, branch name, etc.)"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-stash",
        description: "Stashes current changes",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Message for the stash"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-stash-pop",
        description: "Applies the most recent stash",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-reset",
        description: "Resets repository to a specific commit or state",
        inputSchema: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              enum: ["soft", "mixed", "hard"],
              description: "Reset mode (default: mixed)"
            },
            target: {
              type: "string",
              description: "Target commit or reference (default: HEAD)"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-clone",
        description: "Clones a repository",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Repository URL to clone"
            },
            targetDir: {
              type: "string",
              description: "Target directory name for the cloned repository"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["url"]
        }
      },
      {
        name: "git-init",
        description: "Initializes a new Git repository",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to initialize as a Git repository (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-remote-list",
        description: "Lists all remote repositories",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-remote-add",
        description: "Adds a remote repository",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name for the remote repository"
            },
            url: {
              type: "string",
              description: "URL of the remote repository"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["name", "url"]
        }
      },
      {
        name: "git-remote-remove",
        description: "Removes a remote repository",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the remote repository to remove"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "git-remote-set-url",
        description: "Changes the URL of an existing remote repository",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the remote repository"
            },
            url: {
              type: "string",
              description: "New URL for the remote repository"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["name", "url"]
        }
      },
      {
        name: "git-flow",
        description: "Complete Git workflow: add all changes, commit with message, and push to remote",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Commit message for the workflow"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["message"]
        }
      },
      {
        name: "git-quick-commit",
        description: "Quick commit with automatic message generation based on changes",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Commit message (optional - will auto-generate if not provided)"
            },
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          },
          required: ["message"]
        }
      },
      {
        name: "git-sync",
        description: "Synchronize repository: pull from remote, then push local changes",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            }
          }
        }
      },
      {
        name: "git-tag",
        description: "Manage Git tags: create, list, delete, or show tag details",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            },
            action: {
              type: "string",
              enum: ["list", "create", "delete", "show"],
              description: "The tag action to perform (list, create, delete, show)"
            },
            tagName: {
              type: "string",
              description: "The name of the tag (required for create, delete, show actions)"
            },
            message: {
              type: "string",
              description: "The tag message (optional for create action)"
            }
          }
        }
      },
      {
        name: "git-merge",
        description: "Merge a branch into the current branch with conflict detection",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            },
            branch: {
              type: "string",
              description: "The branch to merge into the current branch"
            },
            strategy: {
              type: "string",
              description: "Merge strategy (optional): ours, theirs, recursive, etc."
            }
          },
          required: ["branch"]
        }
      },
      {
        name: "git-rebase",
        description: "Rebase current branch onto another branch or commit",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            },
            target: {
              type: "string",
              description: "The target branch or commit to rebase onto (defaults to HEAD~1)"
            },
            interactive: {
              type: "boolean",
              description: "Whether to use interactive rebase mode"
            }
          }
        }
      },
      {
        name: "git-cherry-pick",
        description: "Apply changes from a specific commit to the current branch",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            },
            commitHash: {
              type: "string",
              description: "The commit hash to cherry-pick"
            }
          },
          required: ["commitHash"]
        }
      },
      {
        name: "git-blame",
        description: "Show line-by-line authorship information for a file",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            },
            filePath: {
              type: "string",
              description: "The path to the file to show blame information for"
            },
            lineRange: {
              type: "string",
              description: "Line range to show blame for (e.g., '1,10' or '5,+10')"
            }
          },
          required: ["filePath"]
        }
      },
      {
        name: "git-bisect",
        description: "Binary search through commit history to find bugs",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "The directory to run the command in (defaults to current working directory)"
            },
            action: {
              type: "string",
              enum: ["start", "bad", "good", "reset", "status"],
              description: "The bisect action to perform"
            },
            commit: {
              type: "string",
              description: "Specific commit hash (optional for bad/good actions)"
            }
          },
          required: ["action"]
        }
      }
    ]
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "git-add-all":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitAddAll(args?.directory as string))
            }
          ]
        };

      case "git-add":
        if (!args?.files || !Array.isArray(args.files)) {
          throw new Error("files parameter is required and must be an array");
        }
        return {
          content: [
            {
              type: "text", 
              text: JSON.stringify(await gitAdd(args.files as string[], args?.directory as string))
            }
          ]
        };

      case "git-remove":
        if (!args?.file) {
          throw new Error("file parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRemove(args.file as string, args?.directory as string))
            }
          ]
        };

      case "git-remove-all":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRemoveAll(args?.directory as string))
            }
          ]
        };

      case "git-status":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitStatus(args?.directory as string))
            }
          ]
        };

      case "git-commit":
        if (!args?.message) {
          throw new Error("message parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitCommit(args.message as string, args?.directory as string))
            }
          ]
        };

      case "git-push":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitPush(args?.directory as string))
            }
          ]
        };

      case "git-pull":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitPull(args?.directory as string))
            }
          ]
        };

      case "git-branch":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitBranch(args?.branchName as string, args?.directory as string))
            }
          ]
        };

      case "git-checkout":
        if (!args?.branchName) {
          throw new Error("branchName parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitCheckout(args.branchName as string, args?.createNew as boolean, args?.directory as string))
            }
          ]
        };

      case "git-log":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitLog(args?.maxCount as number, args?.directory as string))
            }
          ]
        };

      case "git-diff":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitDiff(args?.target as string, args?.directory as string))
            }
          ]
        };

      case "git-stash":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitStash(args?.message as string, args?.directory as string))
            }
          ]
        };

      case "git-stash-pop":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitStashPop(args?.directory as string))
            }
          ]
        };

      case "git-reset":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitReset(args?.mode as 'soft' | 'mixed' | 'hard', args?.target as string, args?.directory as string))
            }
          ]
        };

      case "git-clone":
        if (!args?.url) {
          throw new Error("url parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitClone(args.url as string, args?.directory as string, args?.targetDir as string))
            }
          ]
        };

      case "git-init":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitInit(args?.directory as string))
            }
          ]
        };

      case "git-remote-list":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRemoteList(args?.directory as string))
            }
          ]
        };

      case "git-remote-add":
        if (!args?.name || !args?.url) {
          throw new Error("name and url parameters are required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRemoteAdd(args.name as string, args.url as string, args?.directory as string))
            }
          ]
        };

      case "git-remote-remove":
        if (!args?.name) {
          throw new Error("name parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRemoteRemove(args.name as string, args?.directory as string))
            }
          ]
        };

      case "git-remote-set-url":
        if (!args?.name || !args?.url) {
          throw new Error("name and url parameters are required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRemoteSetUrl(args.name as string, args.url as string, args?.directory as string))
            }
          ]
        };

      case "git-flow":
        if (!args?.message) {
          throw new Error("message parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitFlow(args.message as string, args?.directory as string))
            }
          ]
        };

      case "git-quick-commit":
        if (!args?.message) {
          throw new Error("message parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitQuickCommit(args.message as string, args?.directory as string))
            }
          ]
        };

      case "git-sync":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitSync(args?.directory as string))
            }
          ]
        };

      case "git-tag":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitTag(args?.directory as string, args?.action as string, args?.tagName as string, args?.message as string))
            }
          ]
        };

      case "git-merge":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitMerge(args?.directory as string, args?.branch as string, args?.strategy as string))
            }
          ]
        };

      case "git-rebase":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitRebase(args?.directory as string, args?.target as string, args?.interactive as boolean))
            }
          ]
        };

      case "git-cherry-pick":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitCherryPick(args?.directory as string, args?.commitHash as string))
            }
          ]
        };

      case "git-blame":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitBlame(args?.directory as string, args?.filePath as string, args?.lineRange as string))
            }
          ]
        };

      case "git-bisect":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await gitBisect(args?.directory as string, args?.action as string, args?.commit as string))
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            message: error instanceof Error ? error.message : String(error)
          })
        }
      ],
      isError: true
    };
  }
});

// === SERVER INITIALIZATION ===

// Setup stdio transport for MCP communication
const transport = new StdioServerTransport();

// Start the MCP server and begin listening for requests
(async () => {
  await server.connect(transport);
})();