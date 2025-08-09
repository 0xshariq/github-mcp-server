#!/usr/bin/env node

/**
 * grelease - Release Management Workflow
 * 
 * Usage:
 *   grelease <version>         - Create release with version tag
 *   grelease --patch           - Auto increment patch version
 *   grelease --minor           - Auto increment minor version  
 *   grelease --major           - Auto increment major version
 *   grelease --prepare         - Prepare for release (check status)
 *   grelease -h, --help        - Show help
 * 
 * Perfect for:
 * - Creating versioned releases
 * - Tagging release commits
 * - Automated version management
 * - Release preparation
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);

// Help and validation
if (args.includes('-h') || args.includes('--help')) {
  console.log(`
🚀 grelease - Release Management

Usage:
  grelease <version>          Create release with specific version
  grelease --patch            Auto increment patch (1.0.0 -> 1.0.1)
  grelease --minor            Auto increment minor (1.0.0 -> 1.1.0)
  grelease --major            Auto increment major (1.0.0 -> 2.0.0)
  grelease --prepare          Check release readiness
  grelease -h, --help         Show this help

Examples:
  grelease 1.2.3              # Create release v1.2.3
  grelease --patch            # Auto increment patch version
  grelease --minor            # Auto increment minor version
  grelease --prepare          # Check if ready for release

Perfect for:
  🏷️  Creating version tags
  📦 Package releases
  🔄 Automated versioning
  ✅ Release validation
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
  
  let output = '';
  if (silent) {
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
  }
  
  childProcess.on('close', (code) => {
    if (code === 0 && onSuccess) {
      onSuccess(output.trim());
    } else if (code !== 0 && onError) {
      onError(code);
    }
  });
  
  childProcess.on('error', (err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

function getPackageVersion() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version || '0.0.0';
    }
  } catch (e) {
    // Ignore errors
  }
  return '0.0.0';
}

function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0] = (parts[0] || 0) + 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] = (parts[1] || 0) + 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] = (parts[2] || 0) + 1;
      break;
  }
  
  return parts.join('.');
}

function checkReleaseReadiness() {
  console.log('🔍 Checking release readiness...');
  
  // Check git status
  runCommand(['git', 'status', '--porcelain'], (output) => {
    if (output) {
      console.log('\n⚠️  Warning: Uncommitted changes detected');
      console.log('📝 Uncommitted files:');
      console.log(output);
      console.log('\n💡 Consider committing changes before release');
    } else {
      console.log('\n✅ Working directory is clean');
    }
    
    // Check if on main branch
    runCommand(['git', 'branch', '--show-current'], (currentBranch) => {
      if (currentBranch !== 'main' && currentBranch !== 'master') {
        console.log(`\n⚠️  Warning: Currently on branch '${currentBranch}'`);
        console.log('💡 Consider switching to main/master for releases');
      } else {
        console.log(`\n✅ On main branch: ${currentBranch}`);
      }
      
      // Check remote sync
      console.log('\n📡 Checking remote sync...');
      runCommand(['git', 'fetch'], () => {
        runCommand(['git', 'status', '-uno'], (statusOutput) => {
          if (statusOutput.includes('behind')) {
            console.log('\n⚠️  Warning: Local branch is behind remote');
            console.log('💡 Run "gpull" to sync with remote');
          } else if (statusOutput.includes('ahead')) {
            console.log('\n⚠️  Warning: Local branch is ahead of remote');
            console.log('💡 Run "gpush" to push local changes');
          } else {
            console.log('\n✅ In sync with remote');
          }
          
          console.log('\n🚀 Release readiness check complete!');
        }, null, true);
      }, null, true);
    }, null, true);
  }, null, true);
}

// Handle different release workflows
if (args.includes('--prepare')) {
  checkReleaseReadiness();
  
} else if (args.includes('--patch') || args.includes('--minor') || args.includes('--major')) {
  const currentVersion = getPackageVersion();
  let versionType = 'patch';
  
  if (args.includes('--major')) versionType = 'major';
  else if (args.includes('--minor')) versionType = 'minor';
  
  const newVersion = incrementVersion(currentVersion, versionType);
  console.log(`📈 Auto incrementing ${versionType}: ${currentVersion} -> ${newVersion}`);
  
  createRelease(newVersion);
  
} else if (args.length > 0 && !args[0].startsWith('--')) {
  // Specific version provided
  const version = args[0];
  console.log(`🏷️  Creating release: ${version}`);
  
  createRelease(version);
  
} else {
  console.error('❌ Error: Version required');
  console.log('💡 Usage: grelease <version> or grelease --patch');
  console.log('💡 Or run: grelease --help for more options');
  process.exit(1);
}

function createRelease(version) {
  // Ensure version starts with 'v'
  const tagVersion = version.startsWith('v') ? version : `v${version}`;
  
  console.log(`🚀 Creating release: ${tagVersion}`);
  
  // First check if we're ready
  runCommand(['git', 'status', '--porcelain'], (output) => {
    if (output) {
      console.log('\n⚠️  Warning: Uncommitted changes detected');
      console.log('💡 Committing changes before release...');
      
      runCommand(['git', 'add', '.'], () => {
        runCommand(['git', 'commit', '-m', `Prepare release ${tagVersion}`], () => {
          proceedWithRelease(tagVersion);
        });
      });
    } else {
      proceedWithRelease(tagVersion);
    }
  }, null, true);
}

function proceedWithRelease(tagVersion) {
  // Create annotated tag
  const releaseMessage = `Release ${tagVersion}`;
  
  runCommand(['git', 'tag', '-a', tagVersion, '-m', releaseMessage], () => {
    console.log(`\n✅ Created tag: ${tagVersion}`);
    
    // Push commits and tags
    runCommand(['git', 'push'], () => {
      runCommand(['git', 'push', '--tags'], () => {
        console.log(`\n🎉 Release ${tagVersion} created and pushed!`);
        console.log('\n💡 Next steps:');
        console.log('   - Create GitHub release from tag');
        console.log('   - Update changelog if needed');
        console.log('   - Announce release to team');
      }, () => {
        console.log(`\n✅ Release ${tagVersion} created locally`);
        console.log('⚠️  Failed to push tags to remote');
        console.log('💡 Run "git push --tags" manually later');
      });
    }, () => {
      console.log(`\n✅ Release ${tagVersion} created locally`);
      console.log('⚠️  Failed to push to remote');
      console.log('💡 Run "gpush && git push --tags" manually later');
    });
  }, () => {
    console.log('\n❌ Failed to create release tag');
    console.log('💡 Check if tag already exists with "git tag -l"');
  });
}
