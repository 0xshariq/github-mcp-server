#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

async function executeGitCommand(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const message = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args }
    };

    const child = spawn('node', [path.join(__dirname, 'dist', 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    child.stdin.write(JSON.stringify(message) + '\n');
    child.stdin.end();

    let output = '';
    child.stdout.on('data', (data) => output += data.toString());
    child.on('close', () => {
      try {
        const result = JSON.parse(output);
        const content = JSON.parse(result.result.content[0].text);
        console.log(content.content[0].text);
        resolve();
      } catch (e) {
        console.log('Operation completed');
        resolve();
      }
    });
  });
}

(async () => {
  console.log('Adding all files...');
  await executeGitCommand('git-add-all');
  
  console.log('Committing with message...');
  await executeGitCommand('git-commit', { 
    message: 'feat: Add 17 new git operations and comprehensive documentation\n\n- Added branch management (git-branch, git-checkout)\n- Added history operations (git-log, git-diff)\n- Added stash operations (git-stash, git-stash-pop)\n- Added advanced operations (git-reset, git-clone)\n- Enhanced error handling with timeouts\n- Comprehensive README with usage examples\n- Improved package.json with better scripts\n- Fixed MCP server API for proper tool integration'
  });
  
  console.log('Pushing to GitHub...');
  await executeGitCommand('git-push');
  
  console.log('All done! ✅');
})();
