#!/usr/bin/env node

/**
 * gfix - Quick Fix Workflow
 * 
 * Usage:
 *   gfix "fix description"     - Quick fix with description
 *   gfix --hotfix "message"    - Create hotfix branch and fix
 *   gfix --amend               - Amend last commit with current changes
 *   gfix --typo                - Fix typo in last commit message
 *   gfix -h, --help            - Show help
 * 
 * Perfect for:
 * - Quick bug fixes
 * - Hotfix workflows
 * - Amending recent commits
 * - Fixing typos and small issues
 */

import { spawn } from 'child_process';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);

// Help and validation
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
🔧 gfix - Quick Fix Workflow

Usage:
  gfix "fix description"      Quick fix with description
  gfix --hotfix "message"     Create hotfix branch and apply fix
  gfix --amend               Amend last commit with current changes
  gfix --typo                Fix typo in last commit message
  gfix -h, --help            Show this help

Examples:
  gfix "Fix login validation"     # Quick fix commit
  gfix --hotfix "Fix crash bug"   # Create hotfix-[timestamp] branch
  gfix --amend                   # Add current changes to last commit
  gfix --typo                    # Edit last commit message

Perfect for:
  🐛 Quick bug fixes
  🚨 Emergency hotfixes  
  ✏️  Amending recent commits
  📝 Fixing commit message typos
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

function getTimestamp() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[T:]/g, '-').slice(0, 16);
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

// Handle different fix workflows
if (args.includes('--amend')) {
  console.log('✏️  Amending last commit with current changes...');
  
  runCommand(['git', 'add', '.'], () => {
    runCommand(['git', 'commit', '--amend', '--no-edit'], () => {
      console.log('\n✅ Last commit amended successfully!');
      console.log('💡 Tip: Use "glog 1" to see the updated commit');
    }, () => {
      console.log('\n⚠️  Nothing to amend or operation failed');
      console.log('💡 Tip: Make sure you have changes and a previous commit');
    });
  });
  
} else if (args.includes('--typo')) {
  console.log('📝 Fixing commit message typo...');
  
  runCommand(['git', 'commit', '--amend'], () => {
    console.log('\n✅ Commit message updated!');
    console.log('💡 Tip: Use "glog 1" to verify the changes');
  }, () => {
    console.log('\n⚠️  Failed to edit commit message');
    console.log('💡 Tip: Make sure you have a previous commit to edit');
  });
  
} else if (args.includes('--hotfix')) {
  const hotfixIndex = args.indexOf('--hotfix');
  const fixMessage = args.slice(hotfixIndex + 1).join(' ');
  
  if (!fixMessage) {
    console.error('❌ Error: Hotfix message required');
    console.log('💡 Usage: gfix --hotfix "emergency fix description"');
    process.exit(1);
  }
  
  const hotfixBranch = `hotfix-${getTimestamp()}`;
  console.log(`🚨 Creating hotfix branch: ${hotfixBranch}`);
  
  getCurrentBranch((currentBranch) => {
    // Switch to main, create hotfix branch
    runCommand(['git', 'checkout', 'main'], () => {
      runCommand(['git', 'pull'], () => {
        runCommand(['git', 'checkout', '-b', hotfixBranch], () => {
          runCommand(['git', 'add', '.'], () => {
            runCommand(['git', 'commit', '-m', `HOTFIX: ${fixMessage}`], () => {
              console.log(`\n✅ Hotfix created on branch: ${hotfixBranch}`);
              console.log('💡 Next steps:');
              console.log('   - Test your fix');
              console.log('   - Use "gpush" to push hotfix');
              console.log('   - Create PR to merge into main');
              console.log(`   - Use "gcheckout ${currentBranch}" to return to work`);
            });
          });
        });
      }, () => {
        // If pull fails, still create hotfix
        runCommand(['git', 'checkout', '-b', hotfixBranch], () => {
          runCommand(['git', 'add', '.'], () => {
            runCommand(['git', 'commit', '-m', `HOTFIX: ${fixMessage}`], () => {
              console.log(`\n✅ Hotfix created: ${hotfixBranch} (pull failed)`);
            });
          });
        });
      });
    });
  });
  
} else if (args.length > 0 && !args[0].startsWith('--')) {
  // Regular fix with description
  const fixMessage = args.join(' ');
  console.log(`🔧 Applying quick fix: "${fixMessage}"`);
  
  runCommand(['git', 'add', '.'], () => {
    runCommand(['git', 'commit', '-m', `Fix: ${fixMessage}`], () => {
      console.log('\n✅ Quick fix applied!');
      console.log('💡 Tip: Use "gpush" to push, or "gflow" for full workflow');
    }, () => {
      console.log('\n⚠️  Nothing to commit or commit failed');
      console.log('💡 Tip: Make some changes first, or check "gstatus"');
    });
  });
  
} else {
  console.error('❌ Error: Fix description required');
  console.log('💡 Usage: gfix "your fix description"');
  console.log('💡 Or run: gfix --help for more options');
  process.exit(1);
}
