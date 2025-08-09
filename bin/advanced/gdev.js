#!/usr/bin/env node

/**
 * gdev - Developer Workflow Start
 * 
 * Usage:
 *   gdev                       - Start dev session (status + pull + branch list)
 *   gdev <branch-name>         - Create and switch to new feature branch
 *   gdev --continue            - Continue work (stash pop + status)
 *   gdev --sync                - Sync with main and return to current branch
 *   gdev -h, --help            - Show help
 * 
 * Perfect for:
 * - Starting daily development session
 * - Creating feature branches
 * - Syncing with latest changes
 * - Continuing previous work
 */

import { spawn } from 'child_process';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);

// Help and validation
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
👨‍💻 gdev - Developer Workflow

Usage:
  gdev                        Start development session
  gdev <branch-name>          Create new feature branch
  gdev --continue             Continue previous work (restore stash)
  gdev --sync                 Sync current branch with main
  gdev -h, --help             Show this help

Examples:
  gdev                        # Check status, pull latest, show branches
  gdev feature-login          # Create and switch to 'feature-login' branch
  gdev --continue             # Restore your stashed work and continue
  gdev --sync                 # Sync current branch with latest main

Perfect for:
  🌅 Starting your coding session
  🌿 Creating feature branches quickly
  🔄 Staying synced with the team
  📂 Managing your work-in-progress
`);
  process.exit(0);
}

// Utility functions
function runCommand(command, onSuccess, onError, silent = false) {
  if (!silent) {
    console.log(`🔄 Running: ${command.join(' ')}`);
  }
  
  const childProcess = spawn(command[0], command.slice(1), {
    stdio: silent ? 'pipe' : 'inherit',
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

function showBranches() {
  console.log('\n🌿 Available Branches:');
  runCommand(['git', 'branch', '-a'], () => {
    console.log('\n✅ Development session ready!');
    console.log('💡 Tip: Use "gstash" to save work, "gflow" to commit & push');
  });
}

function showStatus() {
  console.log('\n📊 Repository Status:');
  runCommand(['git', 'status', '--short']);
}

// Handle different dev workflows
if (args.includes('--continue')) {
  console.log('📂 Continuing previous work...');
  
  runCommand(['git', 'stash', 'pop'], () => {
    console.log('\n✅ Previous work restored!');
    showStatus();
  }, () => {
    console.log('\n💡 No stashed work found, showing current status...');
    showStatus();
  });
  
} else if (args.includes('--sync')) {
  console.log('🔄 Syncing current branch with main...');
  
  // Get current branch name
  const getCurrentBranch = spawn('git', ['branch', '--show-current'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });
  
  getCurrentBranch.stdout.on('data', (data) => {
    const currentBranch = data.toString().trim();
    
    if (currentBranch === 'main' || currentBranch === 'master') {
      console.log('📥 Already on main branch, pulling latest...');
      runCommand(['git', 'pull'], showStatus);
    } else {
      console.log(`🔄 Syncing ${currentBranch} with main...`);
      
      // Checkout main, pull, checkout original branch, merge main
      runCommand(['git', 'checkout', 'main'], () => {
        runCommand(['git', 'pull'], () => {
          runCommand(['git', 'checkout', currentBranch], () => {
            runCommand(['git', 'merge', 'main'], () => {
              console.log(`\n✅ ${currentBranch} synced with latest main!`);
              showStatus();
            });
          });
        });
      });
    }
  });
  
} else if (args.length > 0 && !args[0].startsWith('--')) {
  // Create new branch
  const branchName = args[0];
  console.log(`🌿 Creating feature branch: ${branchName}`);
  
  // Ensure we're on main and have latest
  runCommand(['git', 'checkout', 'main'], () => {
    runCommand(['git', 'pull'], () => {
      runCommand(['git', 'checkout', '-b', branchName], () => {
        console.log(`\n✅ Created and switched to branch: ${branchName}`);
        console.log('💡 Ready to code! Use "gflow" when ready to commit & push');
        showStatus();
      });
    }, () => {
      // If pull fails, still create branch
      runCommand(['git', 'checkout', '-b', branchName], () => {
        console.log(`\n✅ Created branch: ${branchName} (pull failed, but continuing)`);
        showStatus();
      });
    });
  });
  
} else {
  // Default dev session start
  console.log('👨‍💻 Starting development session...');
  
  showStatus();
  
  setTimeout(() => {
    console.log('\n📥 Checking for updates...');
    runCommand(['git', 'pull'], () => {
      showBranches();
    }, () => {
      console.log('\n⚠️  Pull failed, but continuing...');
      showBranches();
    });
  }, 1000);
}
