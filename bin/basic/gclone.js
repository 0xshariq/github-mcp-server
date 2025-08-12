#!/usr/bin/env node

/**
 * gclone - Enhanced Git Clone with Smart Features
 * 
 * Features:
 * - URL validation and format detection
 * - Branch-specific cloning
 * - Shallow clone options for faster downloads
 * - Automatic directory naming
 * - Post-clone setup automation
 * 
 * Usage:
 *   gclone <url> [directory]        - Clone repository
 *   gclone <url> --branch <branch>  - Clone specific branch
 *   gclone <url> --shallow          - Shallow clone (faster)
 *   gclone --help                   - Show this help
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Show help information
function showHelp() {
  console.log(chalk.bold.magenta(`
📥 gclone - Enhanced Git Clone with Smart Features
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('gclone <url>')}                      ${chalk.gray('# Clone to auto-named directory')}`);
  console.log(`   ${chalk.green('gclone <url> <directory>')}          ${chalk.gray('# Clone to specific directory')}`);
  console.log(`   ${chalk.green('gclone <url> --branch <branch>')}    ${chalk.gray('# Clone specific branch only')}`);
  console.log(`   ${chalk.green('gclone <url> --shallow')}            ${chalk.gray('# Shallow clone (faster, less history)')}`);
  console.log(`   ${chalk.green('gclone <url> --depth 5')}            ${chalk.gray('# Clone with limited history')}`);
  console.log(`   ${chalk.green('gclone --help')}                     ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart URL Handling:')} Supports HTTPS, SSH, and GitHub shorthand`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Selection:')} Clone specific branches for faster setup`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Shallow Cloning:')} Download only recent commits for speed`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Auto Naming:')} Intelligent directory naming from repository URL`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Post-Clone Setup:')} Automatic configuration and status check`);
  
  console.log(chalk.cyan('\n💡 URL FORMATS:'));
  console.log(`   ${chalk.blue('HTTPS:')} https://github.com/user/repo.git`);
  console.log(`   ${chalk.blue('SSH:')} git@github.com:user/repo.git`);
  console.log(`   ${chalk.blue('GitHub:')} user/repo (automatic GitHub URL)`);
  console.log(`   ${chalk.blue('Full:')} Any valid Git repository URL`);
  
  console.log(chalk.cyan('\n⚡ CLONE OPTIONS:'));
  console.log(`   ${chalk.blue('Full Clone:')} Complete history and all branches`);
  console.log(`   ${chalk.blue('Branch Clone:')} Single branch with full history`);
  console.log(`   ${chalk.blue('Shallow Clone:')} Recent commits only, much faster`);
  console.log(`   ${chalk.blue('Depth Clone:')} Specific number of commits`);
  
  console.log(chalk.cyan('\n📁 EXAMPLES:'));
  console.log(`   ${chalk.green('gclone facebook/react')} - Clone React from GitHub`);
  console.log(`   ${chalk.green('gclone user/repo my-project')} - Clone to my-project folder`);
  console.log(`   ${chalk.green('gclone user/repo --branch dev')} - Clone dev branch only`);
  console.log(`   ${chalk.green('gclone user/repo --shallow')} - Fast shallow clone`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Parse and validate repository URL
function parseRepoUrl(url) {
  if (!url) {
    return null;
  }
  
  // GitHub shorthand (user/repo)
  if (/^[\w\-_.]+\/[\w\-_.]+$/.test(url) && !url.includes('.')) {
    return {
      original: url,
      https: `https://github.com/${url}.git`,
      ssh: `git@github.com:${url}.git`,
      name: url.split('/')[1]
    };
  }
  
  // Full URLs
  let repoName = '';
  if (url.includes('/')) {
    const parts = url.split('/');
    repoName = parts[parts.length - 1].replace('.git', '');
  }
  
  return {
    original: url,
    https: url,
    ssh: url,
    name: repoName
  };
}

// Check if directory exists and is empty
function checkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { exists: false, empty: true };
  }
  
  const files = fs.readdirSync(dirPath);
  return { exists: true, empty: files.length === 0 };
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
  
  // Validate arguments
  if (args.length === 0) {
    console.log(chalk.red('❌ Error: Repository URL is required'));
    console.log(chalk.yellow(`💡 Usage: ${chalk.green('gclone <repository-url> [directory]')}`));
    console.log(chalk.yellow(`💡 Examples: ${chalk.green('gclone user/repo')} or ${chalk.green('gclone --help')}`));
    process.exit(1);
  }
  
  try {
    const repoUrl = args[0];
    const customDir = args.find(arg => !arg.startsWith('--') && arg !== repoUrl);
    const branch = args.includes('--branch') ? args[args.indexOf('--branch') + 1] : null;
    const shallow = args.includes('--shallow');
    const depth = args.includes('--depth') ? parseInt(args[args.indexOf('--depth') + 1]) : null;
    
    // Parse repository URL
    const repo = parseRepoUrl(repoUrl);
    if (!repo) {
      console.log(chalk.red('❌ Invalid repository URL format'));
      console.log(chalk.yellow('💡 Use: user/repo, https://github.com/user/repo.git, or git@github.com:user/repo.git'));
      process.exit(1);
    }
    
    // Determine target directory
    const targetDir = customDir || repo.name;
    if (!targetDir) {
      console.log(chalk.red('❌ Could not determine directory name'));
      console.log(chalk.yellow('💡 Please specify a directory name: gclone <url> <directory>'));
      process.exit(1);
    }
    
    console.log(chalk.bold.magenta('\n📥 Git Repository Clone'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue('🌐 Repository:'), chalk.white(repo.original));
    console.log(chalk.blue('📁 Directory:'), chalk.white(targetDir));
    if (branch) console.log(chalk.blue('🌿 Branch:'), chalk.white(branch));
    if (shallow) console.log(chalk.blue('⚡ Mode:'), chalk.white('Shallow clone (faster)'));
    if (depth) console.log(chalk.blue('📊 Depth:'), chalk.white(`${depth} commits`));
    
    // Check if directory already exists
    const dirCheck = checkDirectory(targetDir);
    if (dirCheck.exists && !dirCheck.empty) {
      console.log(chalk.red(`❌ Directory "${targetDir}" already exists and is not empty`));
      console.log(chalk.yellow('💡 Choose a different directory name or remove existing directory'));
      process.exit(1);
    }
    
    // Build clone command
    let cloneCommand = `git clone`;
    
    if (branch) {
      cloneCommand += ` --branch ${branch} --single-branch`;
    }
    
    if (shallow) {
      cloneCommand += ` --depth 1`;
    } else if (depth) {
      cloneCommand += ` --depth ${depth}`;
    }
    
    cloneCommand += ` ${repo.https} ${targetDir}`;
    
    console.log(chalk.blue('\n📦 Cloning repository...'));
    
    // Execute clone command
    runGitCommand(cloneCommand, `Repository cloned successfully to ${targetDir}`);
    
    // Post-clone setup
    console.log(chalk.blue('\n🔧 Post-clone setup...'));
    
    // Change to the cloned directory and get basic info
    process.chdir(targetDir);
    
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
      
      console.log(chalk.green('✅ Repository information:'));
      console.log(chalk.gray(`   • Current branch: ${chalk.white(currentBranch)}`));
      console.log(chalk.gray(`   • Remote origin: ${chalk.white(remoteUrl)}`));
      console.log(chalk.gray(`   • Commits: ${chalk.white(commitCount)}`));
      
      // Check for common project files
      const projectFiles = ['package.json', 'README.md', 'Cargo.toml', 'requirements.txt', 'pom.xml'];
      const foundFiles = projectFiles.filter(file => fs.existsSync(file));
      
      if (foundFiles.length > 0) {
        console.log(chalk.blue('📄 Project files found:'), chalk.white(foundFiles.join(', ')));
      }
      
    } catch (error) {
      console.log(chalk.yellow('⚠️ Could not gather additional repository information'));
    }
    
    console.log(chalk.green.bold('\n🎉 Clone completed successfully!'));
    
    console.log(chalk.cyan('\n💡 Next steps:'));
    console.log(chalk.gray(`   • Navigate to directory: ${chalk.green(`cd ${targetDir}`)}`));
    console.log(chalk.gray(`   • Check repository status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • View recent commits: ${chalk.green('glog')}`));
    console.log(chalk.gray(`   • List branches: ${chalk.green('gbranch --all')}`));
    
    if (fs.existsSync('package.json')) {
      console.log(chalk.gray(`   • Install dependencies: ${chalk.green('npm install')}`));
    }
    
    if (fs.existsSync('README.md')) {
      console.log(chalk.gray(`   • Read documentation: ${chalk.green('cat README.md')}`));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Clone operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('Repository not found')) {
      console.log(chalk.yellow('💡 Check if the repository URL is correct and accessible'));
    } else if (error.message.includes('Permission denied')) {
      console.log(chalk.yellow('💡 Check your SSH keys or try HTTPS URL instead'));
    } else if (error.message.includes('network')) {
      console.log(chalk.yellow('💡 Check your internet connection'));
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