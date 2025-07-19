// MCP (Model Context Protocol) SDK imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

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
  gitClone
} from "./github";

// Initialize MCP server with metadata
const server = new Server({
  name: "github-mcp-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// === GIT STAGING OPERATIONS ===

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