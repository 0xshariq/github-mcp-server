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
  gitPull
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