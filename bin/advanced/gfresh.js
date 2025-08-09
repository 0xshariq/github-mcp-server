#!/usr/bin/env node

/**
 * gfresh - Fresh Start Workflow
 * 
 * Usage:
 *   gfresh                    - Fresh start workflow (pull → reset → status)
 *   gfresh -h, --help        - Show help
 *   gfresh --safe            - Safe mode (pull → stash → pull → status)
 *   gfresh --hard            - Hard reset mode (pull → hard reset → status)
 * 
 * Features:
 * - Gets latest changes from remote
 * - Cleans local workspace
 * - Shows final status
 * - Multiple safety levels
 */

import { spawn } from 'child_process';
import path from 'path';

// Get the directory where this script is located
const binDir = __dirname;

// Get command line arguments
const args = process.argv.slice(2);

// Help functionality
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
🌟 gfresh - Fresh Start Workflow

Usage:
  gfresh                Fresh start (pull → reset → status)
  gfresh --safe         Safe mode (pull → stash → pull → status)
  gfresh --hard         Hard reset (pull → hard reset → status)
  gfresh -h, --help     Show this help

Examples:
  gfresh                Get latest and clean workspace
  gfresh --safe         Preserve local changes by stashing
  gfresh --hard         Discard all local changes (DANGEROUS!)
  
What this does:
  Default: 1. 📥 Pull latest changes from remote
           2. 🧹 Reset workspace to clean state
           3. 📊 Show final repository status
           
  --safe:  1. 📥 Pull latest changes
           2. 💼 Stash any local changes
           3. 📥 Pull again to ensure sync
           4. 📊 Show status + stash info
           
  --hard:  1. 📥 Pull latest changes
           2. 🚨 HARD reset (destroys local changes!)
           3. 📊 Show final status

⚠️  WARNING: Default and --hard modes will discard uncommitted changes!
💡 Use --safe to preserve your work, or commit before running.
`);
  process.exit(0);
}

const isSafeMode = args.includes('--safe');
const isHardMode = args.includes('--hard');

if (isSafeMode) {
  console.log('🛡️  Starting SAFE fresh workflow: pull → stash → pull → status...');
} else if (isHardMode) {
  console.log('🚨 Starting HARD fresh workflow: pull → hard reset → status...');
  console.log('⚠️  WARNING: This will destroy all uncommitted changes!');
} else {
  console.log('🌟 Starting fresh workflow: pull → reset → status...');
  console.log('⚠️  Local uncommitted changes will be lost!');
}

console.log('📥 Step 1: Pulling latest changes...');

// Step 1: Pull
const step1Path = path.join(binDir, 'basic', 'gpull.js');
const step1Process = spawn('node', [step1Path], {
  stdio: 'inherit',
  cwd: process.cwd()
});

step1Process.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to pull changes');
    process.exit(code);
  }

  if (isSafeMode) {
    // Safe mode: stash changes
    console.log('💼 Step 2a: Stashing local changes...');
    const stashPath = path.join(binDir, 'basic', 'gstash.js');
    const stashProcess = spawn('node', [stashPath, 'Auto-stash before fresh sync'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    stashProcess.on('close', (stashCode) => {
      console.log('📥 Step 2b: Final pull...');
      const finalPullProcess = spawn('node', [step1Path], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      finalPullProcess.on('close', (pullCode) => {
        finalStep(pullCode);
      });
    });
  } else {
    // Reset mode
    console.log('🧹 Step 2: Resetting workspace...');
    const step2Path = path.join(binDir, 'basic', 'greset.js');
    const resetArgs = isHardMode ? ['hard'] : [];
    
    const step2Process = spawn('node', [step2Path, ...resetArgs], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    step2Process.on('close', (code) => {
      finalStep(code);
    });
  }
});

function finalStep(code) {
  if (code !== 0) {
    console.error('❌ Failed at workspace cleanup step');
    process.exit(code);
  }

  console.log('📊 Step 3: Checking final status...');
  
  // Final step: Status
  const step3Path = path.join(binDir, 'basic', 'gstatus.js');
  const step3Process = spawn('node', [step3Path], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  step3Process.on('close', (code) => {
    if (code === 0) {
      if (isSafeMode) {
        console.log('✅ Safe fresh workflow completed!');
        console.log('💡 Tip: Use "gpop" to restore stashed changes');
      } else if (isHardMode) {
        console.log('✅ Hard fresh workflow completed!');
        console.log('🚨 All local changes have been discarded');
      } else {
        console.log('✅ Fresh workflow completed!');
        console.log('🌟 Repository is now clean and up-to-date');
      }
    } else {
      console.error('❌ Failed to get final status');
    }
    process.exit(code);
  });

  step3Process.on('error', (err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

step1Process.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
