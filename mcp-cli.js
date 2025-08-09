#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ESM equivalents of __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Banner function for consistent visual presentation
function showBanner() {
  console.log();
  console.log(
    chalk.bold.cyan("🚀 GitHub MCP Server") +
      chalk.gray(" - ") +
      chalk.bold.white("Git Operations CLI")
  );
  console.log(chalk.dim("═".repeat(60)));
  console.log();
}

// Available tools in the MCP server
const AVAILABLE_TOOLS = [
  // Basic Operations
  {
    name: "git-init",
    category: "Basic: File Operations",
    binPath: "basic/ginit.js",
    description: "Initialize a new Git repository",
  },
  {
    name: "git-add-all",
    category: "Basic: File Operations",
    binPath: "basic/gadd.js",
    description: "Add all files to staging",
  },
  {
    name: "git-add",
    category: "Basic: File Operations",
    binPath: "basic/gadd.js",
    description: "Add specific files to staging",
    usage: "git-add <files...>",
  },
  {
    name: "git-status",
    category: "Basic: Information",
    binPath: "basic/gstatus.js",
    description: "Show repository status",
  },
  {
    name: "git-log",
    category: "Basic: Information",
    binPath: "basic/glog.js",
    description: "Show commit history",
    usage: "git-log [count]",
  },
  {
    name: "git-diff",
    category: "Basic: Information",
    binPath: "basic/gdiff.js",
    description: "Show differences",
    usage: "git-diff [target]",
  },
  {
    name: "git-commit",
    category: "Basic: Commit & Sync",
    binPath: "basic/gcommit.js",
    description: "Commit staged changes",
    usage: "git-commit <message>",
  },
  {
    name: "git-push",
    category: "Basic: Commit & Sync",
    binPath: "basic/gpush.js",
    description: "Push to remote repository",
  },
  {
    name: "git-pull",
    category: "Basic: Commit & Sync",
    binPath: "basic/gpull.js",
    description: "Pull from remote repository",
  },
  {
    name: "git-branch",
    category: "Basic: Branch Management",
    binPath: "basic/gbranch.js",
    description: "List branches or create new one",
    usage: "git-branch [name]",
  },
  {
    name: "git-checkout",
    category: "Basic: Branch Management",
    binPath: "basic/gcheckout.js",
    description: "Switch to branch",
    usage: "git-checkout <name>",
  },
  {
    name: "git-stash",
    category: "Basic: Stash Operations",
    binPath: "basic/gstash.js",
    description: "Stash current changes",
    usage: "git-stash [message]",
  },
  {
    name: "git-stash-pop",
    category: "Basic: Stash Operations",
    binPath: "basic/gpop.js",
    description: "Apply most recent stash",
  },
  {
    name: "git-reset",
    category: "Basic: Reset Operations",
    binPath: "basic/greset.js",
    description: "Reset repository state",
    usage: "git-reset [mode] [target]",
  },
  {
    name: "git-clone",
    category: "Basic: Repository Operations",
    binPath: "basic/gclone.js",
    description: "Clone repository",
    usage: "git-clone <url> [dir]",
  },
  {
    name: "git-remote-list",
    category: "Basic: Remote Management",
    binPath: "basic/gremote.js",
    description: "List all remote repositories",
  },
  {
    name: "git-remote-add",
    category: "Basic: Remote Management",
    binPath: "basic/gremote-add.js",
    description: "Add remote repository",
    usage: "git-remote-add <name> <url>",
  },
  {
    name: "git-remote-remove",
    category: "Basic: Remote Management",
    binPath: "basic/gremote-remove.js",
    description: "Remove remote repository",
    usage: "git-remote-remove <name>",
  },
  {
    name: "git-remote-set-url",
    category: "Basic: Remote Management",
    binPath: "basic/gremote-set-url.js",
    description: "Change remote URL",
    usage: "git-remote-set-url <name> <url>",
  },

  // Advanced Operations
  {
    name: "git-flow",
    category: "Advanced: Workflow Combinations",
    binPath: "advanced/gflow.js",
    description: "Complete workflow (add→commit→push)",
    usage: "git-flow <message>",
  },
  {
    name: "git-quick-commit",
    category: "Advanced: Workflow Combinations",
    binPath: "advanced/gquick.js",
    description: "Quick commit with auto message",
    usage: "git-quick-commit <message>",
  },
  {
    name: "git-sync",
    category: "Advanced: Workflow Combinations",
    binPath: "advanced/gsync.js",
    description: "Sync with remote (pull→push)",
  },
  {
    name: "git-tag",
    category: "Advanced: Advanced Operations",
    description: "Manage Git tags",
    usage: "git-tag [action] [name] [message]",
  },
  {
    name: "git-merge",
    category: "Advanced: Advanced Operations",
    description: "Merge branch into current",
    usage: "git-merge <branch> [strategy]",
  },
  {
    name: "git-rebase",
    category: "Advanced: Advanced Operations",
    description: "Rebase current branch",
    usage: "git-rebase [target] [--interactive]",
  },
  {
    name: "git-cherry-pick",
    category: "Advanced: Advanced Operations",
    description: "Apply specific commit",
    usage: "git-cherry-pick <commit>",
  },
  {
    name: "git-blame",
    category: "Advanced: Advanced Operations",
    description: "Show line-by-line authorship",
    usage: "git-blame <file> [range]",
  },
  {
    name: "git-bisect",
    category: "Advanced: Advanced Operations",
    description: "Binary search for bugs",
    usage: "git-bisect <action> [commit]",
  },
];

// CLI aliases that map to both bin scripts and MCP operations
const WORKFLOW_COMBINATIONS = [
  // Basic operations with bin paths
  {
    alias: "gstatus",
    command: "git-status",
    description: "Show repository status",
    binPath: "basic/gstatus.js",
  },
  {
    alias: "gadd",
    command: "git-add-all",
    description: "Add all files to staging",
    binPath: "basic/gadd.js",
  },
  {
    alias: "gcommit",
    command: "git-commit",
    description: "Commit with message",
    usage: 'gcommit "message"',
    binPath: "basic/gcommit.js",
  },
  {
    alias: "gpush",
    command: "git-push",
    description: "Push to remote",
    binPath: "basic/gpush.js",
  },
  {
    alias: "gpull",
    command: "git-pull",
    description: "Pull from remote",
    binPath: "basic/gpull.js",
  },
  {
    alias: "glog",
    command: "git-log",
    description: "Show commit history",
    usage: "glog [count]",
    binPath: "basic/glog.js",
  },
  {
    alias: "gdiff",
    command: "git-diff",
    description: "Show differences",
    usage: "gdiff [target]",
    binPath: "basic/gdiff.js",
  },
  {
    alias: "gbranch",
    command: "git-branch",
    description: "List or create branches",
    usage: "gbranch [name]",
    binPath: "basic/gbranch.js",
  },
  {
    alias: "gcheckout",
    command: "git-checkout",
    description: "Switch branches",
    usage: "gcheckout <branch>",
    binPath: "basic/gcheckout.js",
  },
  {
    alias: "gstash",
    command: "git-stash",
    description: "Stash changes",
    usage: "gstash [message]",
    binPath: "basic/gstash.js",
  },
  {
    alias: "gpop",
    command: "git-stash-pop",
    description: "Apply recent stash",
    binPath: "basic/gpop.js",
  },
  {
    alias: "greset",
    command: "git-reset",
    description: "Reset repository",
    usage: "greset [mode] [target]",
    binPath: "basic/greset.js",
  },
  {
    alias: "gclone",
    command: "git-clone",
    description: "Clone repository",
    usage: "gclone <url> [dir]",
    binPath: "basic/gclone.js",
  },
  {
    alias: "gremote",
    command: "git-remote-list",
    description: "List remotes",
    binPath: "basic/gremote.js",
  },
  {
    alias: "ginit",
    command: "git-init",
    description: "Initialize repository",
    binPath: "basic/ginit.js",
  },

  // Advanced operations with bin paths
  {
    alias: "gflow",
    command: "git-flow",
    description: "Complete git workflow",
    usage: 'gflow "message"',
    binPath: "advanced/gflow.js",
  },
  {
    alias: "gquick",
    command: "git-quick-commit",
    description: "Quick commit",
    usage: 'gquick "message"',
    binPath: "advanced/gquick.js",
  },
  {
    alias: "gsync",
    command: "git-sync",
    description: "Sync with remote",
    binPath: "advanced/gsync.js",
  },

  // MCP server only operations (no bin path)
  {
    alias: "gtag",
    command: "git-tag",
    description: "Manage Git tags",
    usage: "gtag <action> [name] [message]",
  },
  {
    alias: "gmerge",
    command: "git-merge",
    description: "Merge branches",
    usage: "gmerge <branch> [strategy]",
  },
  {
    alias: "grebase",
    command: "git-rebase",
    description: "Rebase branches",
    usage: "grebase [target]",
  },
  {
    alias: "gcherry",
    command: "git-cherry-pick",
    description: "Apply specific commit",
    usage: "gcherry <commit>",
  },
  {
    alias: "gblame",
    command: "git-blame",
    description: "Show line-by-line authorship",
    usage: "gblame <file> [range]",
  },
  {
    alias: "gbisect",
    command: "git-bisect",
    description: "Binary search for bugs",
    usage: "gbisect <action> [commit]",
  },
];

// MCP CLI wrapper class
class MCPClient {
  constructor() {
    this.serverPath = path.join(__dirname, "dist", "index.js");
  }

  async listTools() {
    showBanner();

    console.log(
      chalk.bold.blue(`📊 Total: ${AVAILABLE_TOOLS.length} MCP operations`) +
        chalk.gray(" + ") +
        chalk.bold.green(`${WORKFLOW_COMBINATIONS.length} CLI aliases`)
    );
    console.log();

    // Project structure overview with colors
    console.log(chalk.bold.magenta("📁 Project Architecture:"));
    console.log(
      chalk.gray("  ├─") +
        chalk.cyan(" bin/basic/     ") +
        chalk.dim("- 17 essential Git operations (15 aliases)")
    );
    console.log(
      chalk.gray("  ├─") +
        chalk.blue(" bin/advanced/  ") +
        chalk.dim("- 12 sophisticated workflows (3 aliases + 6 MCP-only)")
    );
    console.log(
      chalk.gray("  └─") +
        chalk.green(" MCP server     ") +
        chalk.dim("- All 29 operations accessible via direct MCP calls")
    );
    console.log();

    // Organize tools by category
    const basicCategories = {};
    const advancedCategories = {};

    AVAILABLE_TOOLS.forEach((tool) => {
      if (tool.category.startsWith("Basic:")) {
        const category = tool.category.replace("Basic: ", "");
        if (!basicCategories[category]) basicCategories[category] = [];
        basicCategories[category].push(tool);
      } else if (tool.category.startsWith("Advanced:")) {
        const category = tool.category.replace("Advanced: ", "");
        if (!advancedCategories[category]) advancedCategories[category] = [];
        advancedCategories[category].push(tool);
      }
    });

    // Display basic operations
    console.log(chalk.bold.cyan("📂 Basic MCP Operations (bin/basic/):"));
    Object.entries(basicCategories).forEach(([category, tools]) => {
      console.log(chalk.yellow(`  📁 ${category}:`));
      tools.forEach((tool) => {
        const usage = tool.usage ? chalk.dim(` (${tool.usage})`) : "";
        const command = chalk.bold.green(tool.name.padEnd(18));
        const description = chalk.white(`- ${tool.description}`);
        console.log(`    ${command} ${description}${usage}`);
      });
    });
    console.log();

    // Display advanced operations
    console.log(chalk.bold.blue("🚀 Advanced MCP Operations (bin/advanced/):"));
    Object.entries(advancedCategories).forEach(([category, tools]) => {
      console.log(chalk.yellow(`  🔧 ${category}:`));
      tools.forEach((tool) => {
        const usage = tool.usage ? chalk.dim(` (${tool.usage})`) : "";
        const command = chalk.bold.blue(tool.name.padEnd(18));
        const description = chalk.white(`- ${tool.description}`);
        console.log(`    ${command} ${description}${usage}`);
      });
    });
    console.log();

    // CLI aliases organized by directory structure
    const basicAliases = WORKFLOW_COMBINATIONS.filter(
      (combo) => combo.binPath && combo.binPath.startsWith("basic/")
    );
    const advancedAliases = WORKFLOW_COMBINATIONS.filter(
      (combo) => combo.binPath && combo.binPath.startsWith("advanced/")
    );
    const mcpOnlyAliases = WORKFLOW_COMBINATIONS.filter(
      (combo) => !combo.binPath
    );

    console.log(chalk.bold.magenta("⚡ CLI Workflow Combinations:"));
    console.log(
      chalk.bold.blue(`📊 Total: ${WORKFLOW_COMBINATIONS.length} aliases`) +
        chalk.gray(
          ` (${basicAliases.length} basic + ${advancedAliases.length} advanced + ${mcpOnlyAliases.length} MCP-only)`
        )
    );
    console.log();

    console.log(
      chalk.bold.cyan("  📂 Basic Operations Aliases") +
        chalk.gray(" (bin/basic/):")
    );
    basicAliases.forEach((combo) => {
      const usage = combo.usage ? chalk.dim(` (${combo.usage})`) : "";
      const alias = chalk.bold.green(combo.alias.padEnd(15));
      const description = chalk.white(`→ ${combo.description}`);
      console.log(`    ${alias} ${description}${usage}`);
    });
    console.log();

    console.log(
      chalk.bold.blue("  🚀 Advanced Workflow Aliases") +
        chalk.gray(" (bin/advanced/):")
    );
    advancedAliases.forEach((combo) => {
      const usage = combo.usage ? chalk.dim(` (${combo.usage})`) : "";
      const alias = chalk.bold.blue(combo.alias.padEnd(15));
      const description = chalk.white(`→ ${combo.description}`);
      console.log(`    ${alias} ${description}${usage}`);
    });
    console.log();

    console.log(
      chalk.bold.magenta("  🔧 Specialized Git Operations") +
        chalk.gray(" (MCP server only):")
    );
    mcpOnlyAliases.forEach((combo) => {
      const usage = combo.usage ? chalk.dim(` (${combo.usage})`) : "";
      const alias = chalk.bold.magenta(combo.alias.padEnd(15));
      const description = chalk.white(`→ ${combo.description}`);
      console.log(`    ${alias} ${description}${usage}`);
    });
    console.log();

    console.log(chalk.bold.yellow("🔥 Usage Examples:"));
    console.log(
      chalk.cyan("  📁 Basic Operations") + chalk.gray(" (bin/basic/):")
    );
    console.log(
      chalk.green("    gstatus") +
        chalk.gray("                                 # Check repository status")
    );
    console.log(
      chalk.green("    gadd") +
        chalk.gray("                                    # Add all files")
    );
    console.log(
      chalk.green('    gcommit "Fix bug"') +
        chalk.gray("                  # Commit changes")
    );
    console.log(
      chalk.green("    gpush") +
        chalk.gray("                                   # Push to remote")
    );
    console.log();

    console.log(
      chalk.cyan("  🚀 Advanced Workflows") + chalk.gray(" (bin/advanced/):")
    );
    console.log(
      chalk.blue('    gflow "Complete feature"') +
        chalk.gray("           # Add + commit + push")
    );
    console.log(
      chalk.blue('    gquick "Quick fix"') +
        chalk.gray("                # Quick commit")
    );
    console.log(
      chalk.blue("    gsync") +
        chalk.gray("                               # Pull then push")
    );
    console.log();

    console.log(
      chalk.magenta("  🔧 Specialized Operations") + chalk.gray(" (MCP only):")
    );
    console.log(
      chalk.magenta('    gtag create v1.0.0 "Release"') +
        chalk.gray("     # Create tagged release")
    );
    console.log(
      chalk.magenta("    gmerge feature-branch") +
        chalk.gray("            # Smart merge with conflict detection")
    );
    console.log(
      chalk.magenta("    gblame src/app.js") +
        chalk.gray("               # Line-by-line authorship")
    );
    console.log();

    console.log(chalk.bold.white("📖 Learn More:"));
    console.log(
      chalk.gray("    📚 Basic operations:    ") +
        chalk.cyan("bin/basic/README.md")
    );
    console.log(
      chalk.gray("    🚀 Advanced workflows:  ") +
        chalk.blue("bin/advanced/README.md")
    );
    console.log(
      chalk.gray("    📋 Quick reference:     ") +
        chalk.white("QUICK_REFERENCES.md")
    );
    console.log(
      chalk.gray("    🖥️  CLI help:            ") +
        chalk.yellow("node mcp-cli.js list")
    );
    console.log();
  }

  async callTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      // Add current working directory to arguments if not specified
      if (!args.directory) {
        args.directory = process.cwd();
      }

      const message = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      };

      const child = spawn("node", [this.serverPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: process.cwd(),
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          try {
            const response = JSON.parse(stdout);
            if (response.result && response.result.content) {
              resolve(response.result.content[0].text);
            } else if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve("Operation completed successfully");
            }
          } catch (error) {
            resolve(stdout);
          }
        } else {
          reject(new Error(stderr || "Command failed"));
        }
      });

      child.stdin.write(JSON.stringify(message) + "\n");
      child.stdin.end();
    });
  }

  async runBinScript(binPath, args) {
    const scriptPath = path.join(__dirname, "bin", binPath);

    return new Promise((resolve, reject) => {
      const child = spawn("node", [scriptPath, ...args], {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve("Command completed successfully");
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }

  async handleAlias(alias, args) {
    const combo = WORKFLOW_COMBINATIONS.find((c) => c.alias === alias);
    if (!combo) {
      throw new Error(`Unknown alias: ${alias}`);
    }

    console.log(
      chalk.bold.cyan(`🚀 Executing: ${alias}`) +
        chalk.gray(` (${combo.description})`)
    );

    if (combo.binPath) {
      // Use bin script if available
      console.log(chalk.dim(`📁 Using bin script: ${combo.binPath}`));
      await this.runBinScript(combo.binPath, args);
    } else {
      // Use MCP server for specialized operations
      console.log(chalk.dim(`🔧 Using MCP operation: ${combo.command}`));
      const toolArgs = this.parseArgsForTool(combo.command, args);
      const result = await this.callTool(combo.command, toolArgs);
      console.log(result);
    }
  }

  parseArgsForTool(toolName, args) {
    const toolArgs = {};

    switch (toolName) {
      case "git-commit":
        toolArgs.message = args.join(" ");
        break;
      case "git-tag":
        toolArgs.action = args[0] || "list";
        toolArgs.tagName = args[1];
        toolArgs.message = args[2];
        break;
      case "git-merge":
        toolArgs.branch = args[0];
        toolArgs.strategy = args[1];
        break;
      case "git-rebase":
        toolArgs.target = args[0];
        toolArgs.interactive = args.includes("--interactive");
        break;
      case "git-cherry-pick":
        toolArgs.commitHash = args[0];
        break;
      case "git-blame":
        toolArgs.filePath = args[0];
        toolArgs.lineRange = args[1];
        break;
      case "git-bisect":
        toolArgs.action = args[0];
        toolArgs.commit = args[1];
        break;
      default:
        // For other tools, pass arguments as-is
        if (args.length > 0) {
          toolArgs.args = args;
        }
        break;
    }

    return toolArgs;
  }
}

// CLI entry point
async function main() {
  const client = new MCPClient();
  const args = process.argv.slice(2);

  try {
    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
      await client.listTools();
      return;
    }

    if (args[0] === "list" || args[0] === "ls") {
      await client.listTools();
      return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    // Check if it's an alias
    const alias = WORKFLOW_COMBINATIONS.find((c) => c.alias === command);
    if (alias) {
      await client.handleAlias(command, commandArgs);
      return;
    }

    // Check if it's a direct MCP tool call
    const tool = AVAILABLE_TOOLS.find((t) => t.name === command);
    if (tool) {
      console.log(chalk.bold.green(`🔧 Calling MCP tool: ${command}`));
      const toolArgs = client.parseArgsForTool(command, commandArgs);
      const result = await client.callTool(command, toolArgs);
      console.log(result);
      return;
    }

    // Unknown command
    console.error(chalk.red(`❌ Unknown command: ${command}`));
    console.log(chalk.yellow(`💡 Try: node mcp-cli.js --help`));
    process.exit(1);
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n👋 Goodbye!"));
  process.exit(0);
});

// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red(`💥 Fatal error: ${error.message}`));
    process.exit(1);
  });
}

export { MCPClient, AVAILABLE_TOOLS, WORKFLOW_COMBINATIONS };
