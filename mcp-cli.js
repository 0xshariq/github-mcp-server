#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Enhanced MCP CLI wrapper with better error handling and debugging
class MCPClient {
  constructor() {
    this.serverPath = path.join(__dirname, 'dist', 'index.js');
  }

  async callTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Calling MCP tool: ${toolName}`, args ? `with args: ${JSON.stringify(args)}` : '');
      
      const message = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args }
      };

      console.log(`📤 Sending message: ${JSON.stringify(message)}`);

      const child = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: __dirname
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('❌ Server stderr:', data.toString());
      });
      
      child.on('close', (code) => {
        console.log(`🏁 Process exited with code: ${code}`);
        console.log(`📥 Raw output: ${output}`);
        
        if (errorOutput) {
          console.error('❌ Error output:', errorOutput);
        }

        try {
          if (!output.trim()) {
            reject(new Error('No output received from MCP server'));
            return;
          }

          const result = JSON.parse(output);
          console.log(`📊 Parsed result:`, JSON.stringify(result, null, 2));
          
          if (result.error) {
            console.error('❌ MCP Error:', result.error.message);
            reject(new Error(result.error.message));
          } else if (result.result && result.result.content && result.result.content[0]) {
            const content = JSON.parse(result.result.content[0].text);
            console.log('✅ Success:', content.content[0].text);
            resolve(content);
          } else {
            console.error('❌ Unexpected response format:', result);
            reject(new Error('Unexpected response format'));
          }
        } catch (e) {
          console.error('❌ Parse error:', e.message);
          console.error('❌ Raw output was:', output);
          reject(e);
        }
      });

      child.on('error', (error) => {
        console.error('❌ Process error:', error);
        reject(error);
      });

      child.stdin.write(JSON.stringify(message) + '\n');
      child.stdin.end();

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
  }
}

// Enhanced CLI interface with better argument parsing
const [,, tool, ...argsArray] = process.argv;

if (!tool) {
  console.log(`
🚀 MCP CLI Tool - Git Operations via Model Context Protocol

Usage: 
  npm run mcp <tool-name> [args...]
  node mcp-cli.js <tool-name> [args...]

Examples:
  npm run mcp git-status
  npm run mcp git-add-all
  npm run mcp git-add package.json README.md
  npm run mcp git-commit "Fix authentication bug"
  npm run mcp git-push
  npm run mcp git-branch new-feature
  npm run mcp git-checkout main
  npm run mcp git-log 5

Available tools:
  📁 File Operations:
    git-add-all           - Add all files to staging
    git-add <files...>    - Add specific files to staging
    git-remove <file>     - Remove file from staging
    git-remove-all        - Remove all files from staging
  
  📊 Information:
    git-status           - Show repository status
    git-log [count]      - Show commit history
    git-diff [target]    - Show differences
  
  💾 Commit & Sync:
    git-commit <message> - Commit staged changes
    git-push             - Push to remote repository
    git-pull             - Pull from remote repository
  
  🌿 Branch Management:
    git-branch [name]    - List branches or create new one
    git-checkout <name>  - Switch to branch
  
  💼 Advanced:
    git-stash [message]  - Stash current changes
    git-stash-pop        - Apply most recent stash
    git-reset [mode] [target] - Reset repository state
    git-clone <url> [dir] - Clone repository
  `);
  process.exit(1);
}

const client = new MCPClient();

// Enhanced argument parsing
let parsedArgs = {};

if (argsArray.length > 0) {
  const argString = argsArray.join(' ');
  
  try {
    // Handle different tool types with specific argument parsing
    switch (tool) {
      case 'git-add':
        parsedArgs = { files: argsArray };
        break;
      case 'git-commit':
        parsedArgs = { message: argString };
        break;
      case 'git-remove':
        parsedArgs = { file: argsArray[0] };
        break;
      case 'git-branch':
        if (argsArray[0]) parsedArgs = { branchName: argsArray[0] };
        break;
      case 'git-checkout':
        parsedArgs = { 
          branchName: argsArray[0],
          createNew: argsArray.includes('--create') || argsArray.includes('-b')
        };
        break;
      case 'git-log':
        if (argsArray[0] && !isNaN(parseInt(argsArray[0]))) {
          parsedArgs = { maxCount: parseInt(argsArray[0]) };
        }
        break;
      case 'git-diff':
        if (argsArray[0]) parsedArgs = { target: argsArray[0] };
        break;
      case 'git-stash':
        if (argsArray[0]) parsedArgs = { message: argString };
        break;
      case 'git-reset':
        if (argsArray[0]) {
          parsedArgs = { mode: argsArray[0] };
          if (argsArray[1]) parsedArgs.target = argsArray[1];
        }
        break;
      case 'git-clone':
        parsedArgs = { url: argsArray[0] };
        if (argsArray[1]) parsedArgs.targetDir = argsArray[1];
        break;
      default:
        // For other tools, try to parse as JSON if it looks like JSON
        if (argString.startsWith('{') || argString.startsWith('[')) {
          parsedArgs = JSON.parse(argString);
        }
        break;
    }
  } catch (e) {
    console.error('❌ Invalid arguments:', e.message);
    console.error('💡 Tip: Use simple arguments without quotes for most operations');
    process.exit(1);
  }
}

console.log(`🎯 Executing: ${tool}`, Object.keys(parsedArgs).length > 0 ? `with: ${JSON.stringify(parsedArgs)}` : '');

client.callTool(tool, parsedArgs)
  .then(() => {
    console.log('🎉 Operation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Operation failed:', error.message);
    process.exit(1);
  });
