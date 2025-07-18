import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  gitAddAll,
  gitAdd,
  gitRemove,
  gitRemoveAll,
  gitStatus,
  gitCommit,
  gitPush,
  gitPull
} from "./github.js";

// Create an MCP server
const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0"
});

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
;
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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();