#!/usr/bin/env node

/**
 * gsave - Quick Save Workflow
 * 
 * Usage:
 *   gsave                      - Quick save current work (add + commit)
 *   gsave "message"            - Save with custom message
 *   gsave --push               - Save and push to remote
 *   gsave --wip                - Save as work-in-progress
 *   gsave --backup             - Create backup commit
 *   gsave -h, --help           - Show help
 * 
 * Perfect for:
 * - Quick saves during development
 * - Creating backup points
 * - Work-in-progress commits
 * - Frequent commit habits
 */

import { spawn } from 'child_process';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);

// Help and validation
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
💾 gsave - Quick Save Workflow

Usage:
  gsave                       Quick save with auto message
  gsave "message"             Save with custom commit message
  gsave --push                Save and push to remote
  gsave --wip                 Save as work-in-progress
  gsave --backup              Create backup commit
  gsave -h, --help            Show this help

Examples:
  gsave                       # Auto commit: "Quick save: [timestamp]"
  gsave "Fix login bug"       # Custom commit message
  gsave --wip                 # Commit: "WIP: [current-branch]"
  gsave --backup              # Commit: "Backup: [timestamp]"
  gsave --push                # Save + push to remote

Perfect for:
  ⚡ Quick development saves
  💾 Creating checkpoint commits
  🚧 Work-in-progress snapshots
  📤 Save and share immediately
`);
  process.exit(0);
}

// Utility functions
function runCommand(command, onSuccess, onError) {
  console.log(`🔄 Running: ${command.join(' ')}`);
  const childProcess = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  childProcess.on('close', (code) => {
    if (code === 0 && onSuccess) {
      onSuccess();
    } else if (code !== 0 && onError) {
      onError(code);
    }
  });
  
  childProcess.on('error', (err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

function getCurrentBranch(callback) {
  const gitProcess = spawn('git', ['branch', '--show-current'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });
  
  gitProcess.stdout.on('data', (data) => {
    const branch = data.toString().trim();
    callback(branch);
  });
  
  gitProcess.on('error', () => {
    callback('main'); // fallback
  });
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

// Determine commit message
let commitMessage = '';
let shouldPush = false;

if (args.includes('--push')) {
  shouldPush = true;
  // Remove --push from args for message processing
  const pushIndex = args.indexOf('--push');
  args.splice(pushIndex, 1);
}

if (args.includes('--wip')) {
  getCurrentBranch((branch) => {
    commitMessage = `WIP: ${branch} - ${getTimestamp()}`;
    executeWorkflow();
  });
} else if (args.includes('--backup')) {
  commitMessage = `Backup: ${getTimestamp()}`;
  executeWorkflow();
} else if (args.length > 0 && !args[0].startsWith('--')) {
  // Custom message provided
  commitMessage = args.join(' ');
  executeWorkflow();
} else {
  // Default auto message
  commitMessage = `Quick save: ${getTimestamp()}`;
  executeWorkflow();
}

function executeWorkflow() {
  console.log('💾 Starting quick save workflow...');
  console.log(`📝 Message: "${commitMessage}"`);
  
  // Add all files
  runCommand(['git', 'add', '.'], () => {
    // Commit with message
    runCommand(['git', 'commit', '-m', commitMessage], () => {
      if (shouldPush) {
        console.log('\n📤 Pushing to remote...');
        runCommand(['git', 'push'], () => {
          console.log('\n✅ Quick save complete with push!');
          console.log('💡 Tip: Use "gdev" to start next development session');
        }, () => {
          console.log('\n✅ Quick save complete (push failed)');
          console.log('💡 Tip: Check remote connection and try "gpush" later');
        });
      } else {
        console.log('\n✅ Quick save complete!');
        console.log('💡 Tip: Use "gpush" to push, or "gsave --push" next time');
      }
    }, (code) => {
      console.log('\n⚠️  Nothing to commit or commit failed');
      console.log('💡 Tip: Make some changes first, or check "gstatus"');
    });
  }, (code) => {
    console.log('\n❌ Failed to add files');
    process.exit(code);
  });
}
