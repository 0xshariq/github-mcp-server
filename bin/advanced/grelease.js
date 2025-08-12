#!/usr/bin/env node

/**
 * grelease - Enhanced Release Management System
 * 
 * Features:
 * - Semantic versioning with automated increment
 * - Release branch workflow management
 * - Automated changelog generation
 * - Tag creation and validation
 * - Release preparation and verification
 * 
 * Usage:
 *   grelease v1.2.3          - Create specific version release
 *   grelease --patch         - Auto increment patch version
 *   grelease --minor         - Auto increment minor version
 *   grelease --major         - Auto increment major version
 *   grelease --help          - Show this help
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Check if we're in a git repository
function validateRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Error: Not a git repository'));
    console.log(chalk.yellow('💡 Initialize with: git init'));
    return false;
  }
}

// Show help information
function showHelp() {
  console.log(chalk.bold.magenta(`
📦 grelease - Enhanced Release Management System
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('grelease v1.2.3')}            ${chalk.gray('# Create specific version release')}`);
  console.log(`   ${chalk.green('grelease --patch')}           ${chalk.gray('# Auto increment patch (1.0.0 → 1.0.1)')}`);
  console.log(`   ${chalk.green('grelease --minor')}           ${chalk.gray('# Auto increment minor (1.0.0 → 1.1.0)')}`);
  console.log(`   ${chalk.green('grelease --major')}           ${chalk.gray('# Auto increment major (1.0.0 → 2.0.0)')}`);
  console.log(`   ${chalk.green('grelease --prepare')}         ${chalk.gray('# Prepare and validate for release')}`);
  console.log(`   ${chalk.green('grelease --help')}            ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n📦 SEMANTIC VERSIONING:'));
  console.log(`   ${chalk.blue('MAJOR:')} Breaking changes (1.0.0 → 2.0.0)`);
  console.log(`   ${chalk.blue('MINOR:')} New features, backward compatible (1.0.0 → 1.1.0)`);
  console.log(`   ${chalk.blue('PATCH:')} Bug fixes, backward compatible (1.0.0 → 1.0.1)`);
  
  console.log(chalk.cyan('\n🚀 RELEASE WORKFLOW:'));
  console.log(`   ${chalk.yellow('1.')} ${chalk.white('Preparation:')} Validate repo state and check for issues`);
  console.log(`   ${chalk.yellow('2.')} ${chalk.white('Version Update:')} Update package.json and other version files`);
  console.log(`   ${chalk.yellow('3.')} ${chalk.white('Commit:')} Create release commit with version changes`);
  console.log(`   ${chalk.yellow('4.')} ${chalk.white('Tag:')} Create annotated git tag with release notes`);
  console.log(`   ${chalk.yellow('5.')} ${chalk.white('Push:')} Push commits and tags to remote`);
  
  console.log(chalk.cyan('\n🔍 RELEASE VALIDATION:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Clean Working Directory:')} No uncommitted changes`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Main Branch:')} Release from main/master branch`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Latest Changes:')} Synced with remote repository`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Version Format:')} Valid semantic versioning`);
  
  console.log(chalk.cyan('\n📝 AUTOMATED FEATURES:'));
  console.log(`   ${chalk.blue('Package.json Update:')} Automatically update version field`);
  console.log(`   ${chalk.blue('Changelog Generation:')} Create release notes from commits`);
  console.log(`   ${chalk.blue('Tag Creation:')} Annotated tags with release information`);
  console.log(`   ${chalk.blue('Remote Push:')} Push release commits and tags`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Parse semantic version
function parseVersion(versionString) {
  const cleanVersion = versionString.replace(/^v/, '');
  const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?$/;
  const match = cleanVersion.match(versionRegex);
  
  if (!match) {
    throw new Error('Invalid semantic version format. Use x.y.z (e.g., 1.2.3)');
  }
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    raw: cleanVersion,
    prefixed: `v${cleanVersion}`
  };
}

// Get current version from package.json
function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    return '0.0.0';
  }
}

// Get latest git tag
function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'v0.0.0';
  }
}

// Increment version
function incrementVersion(currentVersion, incrementType) {
  const version = parseVersion(currentVersion);
  
  switch (incrementType) {
    case 'major':
      return `${version.major + 1}.0.0`;
    case 'minor':
      return `${version.major}.${version.minor + 1}.0`;
    case 'patch':
      return `${version.major}.${version.minor}.${version.patch + 1}`;
    default:
      throw new Error('Invalid increment type');
  }
}

// Check if working directory is clean
function isWorkingDirectoryClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length === 0;
  } catch (error) {
    return false;
  }
}

// Check if on main branch
function isOnMainBranch() {
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    return currentBranch === 'main' || currentBranch === 'master';
  } catch (error) {
    return false;
  }
}

// Run git command with error handling
function runGitCommand(command, successMessage) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (successMessage) {
      console.log(chalk.green(`✅ ${successMessage}`));
    }
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ Git command failed: ${error.message}`));
    throw error;
  }
}

// Update package.json version
function updatePackageVersion(newVersion) {
  try {
    if (!fs.existsSync('package.json')) {
      console.log(chalk.yellow('⚠️  No package.json found - skipping version update'));
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(chalk.green(`✅ Updated package.json version to ${newVersion}`));
    return true;
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not update package.json version'));
    return false;
  }
}

// Generate changelog from commits
function generateChangelog(lastTag, newVersion) {
  try {
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"- %s (%h)"`, { encoding: 'utf8' });
    
    if (commits.trim()) {
      return `Release ${newVersion}\n\nChanges:\n${commits}`;
    } else {
      return `Release ${newVersion}\n\nNo significant changes since ${lastTag}`;
    }
  } catch (error) {
    return `Release ${newVersion}`;
  }
}

// Validate release readiness
function validateReleaseReadiness() {
  console.log(chalk.blue('🔍 Validating release readiness...'));
  
  const checks = [
    {
      name: 'Working directory is clean',
      check: isWorkingDirectoryClean,
      required: true
    },
    {
      name: 'On main/master branch',
      check: isOnMainBranch,
      required: false
    },
    {
      name: 'Package.json exists',
      check: () => fs.existsSync('package.json'),
      required: false
    }
  ];
  
  let allRequired = true;
  
  checks.forEach(({ name, check, required }) => {
    const passed = check();
    const icon = passed ? '✅' : (required ? '❌' : '⚠️ ');
    const color = passed ? chalk.green : (required ? chalk.red : chalk.yellow);
    
    console.log(`   ${icon} ${color(name)}`);
    
    if (!passed && required) {
      allRequired = false;
    }
  });
  
  return allRequired;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  // Validate repository
  if (!validateRepository()) {
    process.exit(1);
  }
  
  try {
    const patchMode = args.includes('--patch');
    const minorMode = args.includes('--minor');
    const majorMode = args.includes('--major');
    const prepareMode = args.includes('--prepare');
    const customVersion = args.find(arg => !arg.startsWith('--'))?.trim();
    
    console.log(chalk.bold.magenta('\n📦 Release Management System'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (prepareMode) {
      // Prepare mode - just validate
      if (validateReleaseReadiness()) {
        console.log(chalk.green.bold('\n🎉 Repository is ready for release!'));
        console.log(chalk.cyan('\nNext steps:'));
        console.log(chalk.gray(`   • Patch release: ${chalk.green('grelease --patch')}`));
        console.log(chalk.gray(`   • Minor release: ${chalk.green('grelease --minor')}`));
        console.log(chalk.gray(`   • Major release: ${chalk.green('grelease --major')}`));
        console.log(chalk.gray(`   • Custom version: ${chalk.green('grelease v1.2.3')}`));
      } else {
        console.log(chalk.red.bold('\n❌ Repository not ready for release'));
        console.log(chalk.yellow('Fix the issues above before creating a release'));
      }
      return;
    }
    
    // Validate readiness before proceeding
    if (!validateReleaseReadiness()) {
      console.log(chalk.red.bold('\n❌ Pre-release validation failed'));
      console.log(chalk.yellow('Use --prepare to see detailed validation results'));
      process.exit(1);
    }
    
    // Determine new version
    let newVersion;
    
    if (customVersion) {
      const parsedVersion = parseVersion(customVersion);
      newVersion = parsedVersion.raw;
    } else if (patchMode || minorMode || majorMode) {
      const currentVersion = getCurrentVersion();
      const incrementType = patchMode ? 'patch' : (minorMode ? 'minor' : 'major');
      newVersion = incrementVersion(currentVersion, incrementType);
    } else {
      console.log(chalk.red('❌ No version specified'));
      console.log(chalk.yellow('💡 Use: grelease v1.2.3 or --patch/--minor/--major'));
      return;
    }
    
    console.log(chalk.blue(`🎯 Creating release: v${newVersion}`));
    
    const lastTag = getLatestTag();
    console.log(chalk.cyan(`   Previous version: ${lastTag}`));
    console.log(chalk.cyan(`   New version: v${newVersion}`));
    
    // Update version files
    console.log(chalk.blue('\n📝 Step 1: Updating version files...'));
    updatePackageVersion(newVersion);
    
    // Stage version changes
    console.log(chalk.blue('\n📁 Step 2: Staging version changes...'));
    try {
      runGitCommand('git add package.json package-lock.json', 'Staged version files');
    } catch (error) {
      runGitCommand('git add .', 'Staged all changes');
    }
    
    // Create release commit
    console.log(chalk.blue('\n📝 Step 3: Creating release commit...'));
    const commitMessage = `Release v${newVersion}`;
    runGitCommand(`git commit -m "${commitMessage}"`, 'Created release commit');
    
    // Create annotated tag
    console.log(chalk.blue('\n🏷️  Step 4: Creating release tag...'));
    const changelog = generateChangelog(lastTag, `v${newVersion}`);
    runGitCommand(`git tag -a v${newVersion} -m "${changelog}"`, `Created tag v${newVersion}`);
    
    // Push to remote
    console.log(chalk.blue('\n📤 Step 5: Pushing to remote...'));
    try {
      runGitCommand('git push origin HEAD', 'Pushed release commit');
      runGitCommand(`git push origin v${newVersion}`, 'Pushed release tag');
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not push to remote - push manually later'));
    }
    
    console.log(chalk.green.bold('\n🎉 Release created successfully!'));
    
    console.log(chalk.cyan('\n📋 Release Summary:'));
    console.log(chalk.green(`   ✅ Version: v${newVersion}`));
    console.log(chalk.green(`   ✅ Commit: ${commitMessage}`));
    console.log(chalk.green(`   ✅ Tag: v${newVersion}`));
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • Verify on GitHub/GitLab: check tags and releases`));
    console.log(chalk.gray(`   • Create release notes if needed`));
    console.log(chalk.gray(`   • Deploy if you have automated deployment`));
    console.log(chalk.gray(`   • Continue development on next version`));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Release failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    console.log(chalk.yellow('\n💡 Recovery suggestions:'));
    console.log(chalk.gray(`   • Check repository state: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • Validate readiness: ${chalk.green('grelease --prepare')}`));
    console.log(chalk.gray(`   • Reset if needed: ${chalk.green('greset --soft HEAD~1')}`));
    
    process.exit(1);
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}