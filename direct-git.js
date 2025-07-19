#!/usr/bin/env node

const { execSync } = require('child_process');

class DirectGit {
  static execute(operation, ...args) {
    try {
      let command;
      let message;
      
      switch (operation) {
        case 'status':
          command = 'git status --porcelain';
          message = 'Checking git status';
          break;
        case 'add-all':
          command = 'git add .';
          message = 'Adding all files to staging';
          break;
        case 'add':
          command = `git add ${args.join(' ')}`;
          message = `Adding files: ${args.join(' ')}`;
          break;
        case 'commit':
          const commitMessage = args.join(' ');
          command = `git commit -m "${commitMessage}"`;
          message = `Committing with message: ${commitMessage}`;
          break;
        case 'push':
          command = 'git push';
          message = 'Pushing to remote repository';
          break;
        case 'pull':
          command = 'git pull';
          message = 'Pulling from remote repository';
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      console.log(`🔧 ${message}...`);
      const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
      console.log(`✅ Success!`);
      if (output.trim()) {
        console.log(output);
      }
      return output;
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      if (error.stdout) console.log(error.stdout);
      if (error.stderr) console.error(error.stderr);
      throw error;
    }
  }
}

// Export for use by the assistant
module.exports = DirectGit;

// CLI usage if run directly
if (require.main === module) {
  const [,, operation, ...args] = process.argv;
  
  if (!operation) {
    console.log(`
Usage: node direct-git.js <operation> [args...]

Operations:
  status          - Show git status
  add-all         - Add all files
  add <files...>  - Add specific files
  commit <msg>    - Commit with message
  push            - Push to remote
  pull            - Pull from remote

Examples:
  node direct-git.js status
  node direct-git.js add-all
  node direct-git.js commit "Fix bugs"
  node direct-git.js push
    `);
    process.exit(1);
  }
  
  DirectGit.execute(operation, ...args);
}
