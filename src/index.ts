// MCP (Model Context Protocol) SDK imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0"
});

// === GIT STAGING OPERATIONS ===

// Tool: Add all files to staging area
server.tool(
  "git-add-all",
  "Adds all files to the staging area",
  {
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitAddAll(args.directory);
  }
);

// Tool: Add specific file to staging area
server.tool(
  "git-add",
  "Adds a specific file to the staging area",
  {
    file: z.string().describe("The file to add to the staging area"),
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitAdd(args.file, args.directory);
  }
);

// Tool: Remove specific file from staging area (unstage)
server.tool(
  "git-remove",
  "Removes a specific file from the staging area",
  {
    file: z.string().describe("The file to remove from the staging area"),
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitRemove(args.file, args.directory);
  }
);

// Tool: Remove all files from staging area (unstage all)
server.tool(
  "git-remove-all",
  "Removes all files from the staging area",
  {
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitRemoveAll(args.directory);
  }
);
// === REPOSITORY STATUS & INFORMATION ===

// Tool: Check repository status
server.tool(
  "git-status",
  "Displays the status of the git repository",
  {
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitStatus(args.directory);
  }
);

// === COMMIT & SYNC OPERATIONS ===

// Tool: Commit staged changes with message
server.tool(
  "git-commit",
  "Commits staged files",
  {
    message: z.string().describe("Commit message"),
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitCommit(args.message, args.directory);
  }
);

// Tool: Push commits to remote repository
server.tool(
  "git-push",
  "Pushes committed files to the remote repository",
  {
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitPush(args.directory);
  }
);

// Tool: Pull changes from remote repository
server.tool(
  "git-pull",
  "Pulls changes from the remote repository",
  {
    directory: z.string().optional().describe("The directory to run the command in (defaults to current working directory)")
  },
  async (args, extra) => {
    return await gitPull(args.directory);
  }
);

// === SERVER INITIALIZATION ===

// Setup stdio transport for MCP communication
const transport = new StdioServerTransport();

// Start the MCP server and begin listening for requests
(async () => {
  await server.connect(transport);
})();