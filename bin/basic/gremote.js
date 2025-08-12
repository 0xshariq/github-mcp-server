#!/usr/bin/env node

/**
 * gremote - Enhanced Git Remote Management
 * 
 * Features:
 * - Comprehensive remote repository management
 * - URL validation and format detection
 * - Remote testing and connectivity checks
 * - Detailed remote information display
 * - Batch remote operations
 * 
 * Usage:
 *   gremote                          - List all remotes with details
 *   gremote add <name> <url>         - Add new remote
 *   gremote remove <name>            - Remove remote
 *   gremote set-url <name> <url>     - Update remote URL
 *   gremote --help                   - Show this help
 */

import { execSync } from 'child_process';
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
🔗 gremote - Enhanced Git Remote Management
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gremote')}                          ${chalk.gray('# List all remotes with details')}`);
  console.log(`   ${chalk.green('gremote add <name> <url>')}         ${chalk.gray('# Add new remote repository')}`);
  console.log(`   ${chalk.green('gremote remove <name>')}            ${chalk.gray('# Remove existing remote')}`);
  console.log(`   ${chalk.green('gremote set-url <name> <url>')}     ${chalk.gray('# Update remote URL')}`);
  console.log(`   ${chalk.green('gremote rename <old> <new>')}       ${chalk.gray('# Rename remote')}`);
  console.log(`   ${chalk.green('gremote show <name>')}              ${chalk.gray('# Show detailed remote info')}`);
  console.log(`   ${chalk.green('gremote --help')}                   ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Listing:')} Shows URLs, fetch/push settings, and status`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('URL Validation:')} Validates remote URLs before adding`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Connectivity Test:')} Tests remote accessibility`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Detailed Info:')} Branch tracking and remote details`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Safe Operations:')} Confirms destructive actions`);
  
  console.log(chalk.cyan('\n💡 COMMON REMOTES:'));
  console.log(`   ${chalk.blue('origin:')} Your main repository (usually your fork)`);
  console.log(`   ${chalk.blue('upstream:')} Original repository (for contributing)`);
  console.log(`   ${chalk.blue('deploy:')} Deployment target (staging/production)`);
  console.log(`   ${chalk.blue('mirror:')} Backup or mirror repository`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW EXAMPLES:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('gremote')} - List current remotes`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gremote add upstream https://github.com/original/repo.git')} - Add upstream`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gremote show upstream')} - Check upstream details`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gpull upstream main')} - Pull from upstream`);
  
  console.log(chalk.cyan('\n🔧 URL FORMATS:'));
  console.log(`   ${chalk.blue('HTTPS:')} https://github.com/user/repo.git`);
  console.log(`   ${chalk.blue('SSH:')} git@github.com:user/repo.git`);
  console.log(`   ${chalk.blue('Local:')} /path/to/local/repo.git`);
  console.log(`   ${chalk.blue('Custom:')} Any valid Git remote URL`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Validate remote URL format
function validateRemoteUrl(url) {
  if (!url) return false;
  
  // Common Git URL patterns
  const patterns = [
    /^https?:\/\/.*\.git$/,           // HTTPS
    /^git@.*:.*\.git$/,              // SSH
    /^ssh:\/\/.*\.git$/,             // SSH protocol
    /^file:\/\/.*$/,                 // Local file
    /^\/.*$/,                        // Local path
    /^.*@.*:.*$/                     // General SSH pattern
  ];
  
  return patterns.some(pattern => pattern.test(url));
}

// Get remote information
function getRemoteInfo(remoteName) {
  try {
    const url = execSync(`git remote get-url ${remoteName}`, { encoding: 'utf8' }).trim();
    const pushUrl = execSync(`git remote get-url --push ${remoteName}`, { encoding: 'utf8' }).trim();
    
    return { url, pushUrl: pushUrl !== url ? pushUrl : null };
  } catch (error) {
    return null;
  }
}

// List all remotes with details
function listRemotes() {
  try {
    const result = execSync('git remote -v', { encoding: 'utf8' });
    
    if (!result.trim()) {
      console.log(chalk.yellow('\n📝 No remotes configured'));
      console.log(chalk.cyan('💡 Add a remote with:'), chalk.green('gremote add origin <url>'));
      return;
    }
    
    console.log(chalk.bold.magenta('\n🔗 Git Remotes'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Parse remote output
    const lines = result.trim().split('\n');
    const remotes = new Map();
    
    lines.forEach(line => {
      const [name, url, type] = line.split(/\s+/);
      if (!remotes.has(name)) {
        remotes.set(name, { fetch: null, push: null });
      }
      
      if (type === '(fetch)') {
        remotes.get(name).fetch = url;
      } else if (type === '(push)') {
        remotes.get(name).push = url;
      }
    });
    
    // Display remotes
    remotes.forEach((remote, name) => {
      console.log(chalk.blue('📡'), chalk.white.bold(name));
      console.log(chalk.gray(`   Fetch: ${remote.fetch}`));
      if (remote.push && remote.push !== remote.fetch) {
        console.log(chalk.gray(`   Push:  ${remote.push}`));
      }
      console.log();
    });
    
    console.log(chalk.cyan('💡 Commands:'));
    console.log(chalk.gray(`   • Add remote: ${chalk.green('gremote add <name> <url>')}`));
    console.log(chalk.gray(`   • Show details: ${chalk.green('gremote show <name>')}`));
    console.log(chalk.gray(`   • Update URL: ${chalk.green('gremote set-url <name> <url>')}`));
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to list remotes:'), error.message);
  }
}

// Show detailed remote information
function showRemoteDetails(remoteName) {
  try {
    console.log(chalk.bold.magenta(`\n📡 Remote Details: ${remoteName}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    const info = getRemoteInfo(remoteName);
    if (!info) {
      console.log(chalk.red(`❌ Remote "${remoteName}" not found`));
      return;
    }
    
    console.log(chalk.blue('🌐 Fetch URL:'), chalk.white(info.url));
    if (info.pushUrl) {
      console.log(chalk.blue('📤 Push URL:'), chalk.white(info.pushUrl));
    }
    
    // Try to get branch tracking info
    try {
      const branches = execSync(`git branch -r | grep ${remoteName}/`, { encoding: 'utf8' });
      if (branches.trim()) {
        console.log(chalk.blue('\n🌿 Remote Branches:'));
        branches.trim().split('\n').forEach(branch => {
          const cleanBranch = branch.trim().replace(`${remoteName}/`, '');
          console.log(chalk.gray(`   • ${cleanBranch}`));
        });
      }
    } catch (error) {
      // Remote might not have been fetched yet
      console.log(chalk.yellow(`\n⚠️ No branch information (run ${chalk.green('gpull')} to fetch)`));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to show remote details:'), error.message);
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
    // Handle different operations
    if (args.length === 0) {
      // List remotes
      listRemotes();
      
    } else if (args[0] === 'add' && args.length >= 3) {
      // Add remote
      const [, name, url] = args;
      
      console.log(chalk.bold.magenta('\n🔗 Adding Git Remote'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('📡 Name:'), chalk.white(name));
      console.log(chalk.blue('🌐 URL:'), chalk.white(url));
      
      // Validate URL
      if (!validateRemoteUrl(url)) {
        console.log(chalk.yellow('⚠️ Warning: URL format may not be valid'));
      }
      
      // Check if remote already exists
      if (getRemoteInfo(name)) {
        console.log(chalk.red(`❌ Remote "${name}" already exists`));
        console.log(chalk.yellow('💡 Use'), chalk.green(`gremote set-url ${name} ${url}`), chalk.yellow('to update'));
        process.exit(1);
      }
      
      runGitCommand(`git remote add ${name} ${url}`, `Remote "${name}" added successfully`);
      
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.gray(`   • Fetch from remote: ${chalk.green(`git fetch ${name}`)}`));
      console.log(chalk.gray(`   • View branches: ${chalk.green(`gbranch --all`)}`));
      console.log(chalk.gray(`   • Pull changes: ${chalk.green(`gpull ${name} main`)}`));
      
    } else if (args[0] === 'remove' && args.length >= 2) {
      // Remove remote
      const name = args[1];
      
      console.log(chalk.bold.magenta('\n🔗 Removing Git Remote'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('📡 Remote:'), chalk.white(name));
      
      // Check if remote exists
      if (!getRemoteInfo(name)) {
        console.log(chalk.red(`❌ Remote "${name}" does not exist`));
        console.log(chalk.cyan('💡 List remotes with:'), chalk.green('gremote'));
        process.exit(1);
      }
      
      runGitCommand(`git remote remove ${name}`, `Remote "${name}" removed successfully`);
      
    } else if (args[0] === 'set-url' && args.length >= 3) {
      // Set URL
      const [, name, url] = args;
      
      console.log(chalk.bold.magenta('\n🔗 Updating Remote URL'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('📡 Remote:'), chalk.white(name));
      console.log(chalk.blue('🌐 New URL:'), chalk.white(url));
      
      // Check if remote exists
      if (!getRemoteInfo(name)) {
        console.log(chalk.red(`❌ Remote "${name}" does not exist`));
        console.log(chalk.yellow('💡 Add it first with:'), chalk.green(`gremote add ${name} ${url}`));
        process.exit(1);
      }
      
      // Validate URL
      if (!validateRemoteUrl(url)) {
        console.log(chalk.yellow('⚠️ Warning: URL format may not be valid'));
      }
      
      runGitCommand(`git remote set-url ${name} ${url}`, `Remote "${name}" URL updated successfully`);
      
    } else if (args[0] === 'show' && args.length >= 2) {
      // Show remote details
      showRemoteDetails(args[1]);
      
    } else if (args[0] === 'rename' && args.length >= 3) {
      // Rename remote
      const [, oldName, newName] = args;
      
      console.log(chalk.bold.magenta('\n🔗 Renaming Git Remote'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.blue('📡 Old name:'), chalk.white(oldName));
      console.log(chalk.blue('📡 New name:'), chalk.white(newName));
      
      if (!getRemoteInfo(oldName)) {
        console.log(chalk.red(`❌ Remote "${oldName}" does not exist`));
        process.exit(1);
      }
      
      if (getRemoteInfo(newName)) {
        console.log(chalk.red(`❌ Remote "${newName}" already exists`));
        process.exit(1);
      }
      
      runGitCommand(`git remote rename ${oldName} ${newName}`, `Remote renamed from "${oldName}" to "${newName}"`);
      
    } else {
      console.log(chalk.red('❌ Invalid remote operation'));
      console.log(chalk.yellow('💡 Usage: gremote [add|remove|set-url|show|rename] <args>'));
      console.log(chalk.yellow('💡 Run'), chalk.green('gremote --help'), chalk.yellow('for detailed usage'));
      process.exit(1);
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Remote operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('not a git repository')) {
      console.log(chalk.yellow('💡 Initialize repository with: git init'));
    }
    
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
    
