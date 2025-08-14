#!/usr/bin/env node

/**
 * gclone - Enhanced Git Clone with Smart Features:
 * - URL validation and format detection
 * - Branch-specific cloning
 * - Depth control for optimized clones
 * - Automatic directory naming
 * - Post-clone setup automation
 * 
 * Usage:
 *   gclone <url> [directory]        - Clone repository
 *   gclone <url> --branch <branch>  - Clone specific branch
 *   gclone <url> --depth 1          - Single commit clone (faster)
 *   gclone --help                   - Show this help
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Show help information
function showHelp() {
  console.log(chalk.magenta.bold('\n📥 gclone - Clone Git Repositories\n'));
  console.log(chalk.cyan('Purpose:'), 'Clone remote Git repositories with comprehensive options for branch selection, depth control, and directory management.\n');
  
  console.log(chalk.cyan('Command:'), chalk.white('gclone <url> [directory] [options]\n'));
  
  console.log(chalk.cyan('Parameters:'));
  console.log('  ' + chalk.white('<url>') + '         - Repository URL (HTTPS/SSH) or GitHub shorthand (user/repo)');
  console.log('  ' + chalk.white('[directory]') + '   - Target directory for cloned repository (optional)\n');
  
  console.log(chalk.cyan('Essential Options:'));
  console.log('  ' + chalk.green('--branch <branch>') + '       - Clone only the specified branch');
  console.log('  ' + chalk.green('-b <branch>') + '             - Same as --branch');
  console.log('  ' + chalk.green('--depth <n>') + '             - Create shallow clone with n commits (use 1 for latest only)');
  console.log('  ' + chalk.green('--single-branch') + '         - Clone only one branch instead of all');
  console.log('  ' + chalk.green('--no-single-branch') + '      - Clone all branches (default)');
  console.log('  ' + chalk.green('--recurse-submodules') + '    - Initialize and clone submodules');
  console.log('  ' + chalk.green('--shallow-submodules') + '    - Clone submodules with depth 1');
  console.log('  ' + chalk.green('-j <n>, --jobs <n>') + '      - Number of submodules to clone in parallel');
  console.log('  ' + chalk.green('-v, --verbose') + '           - Show verbose output during clone');
  console.log('  ' + chalk.green('-q, --quiet') + '             - Suppress all output except errors');
  console.log('  ' + chalk.green('-n, --no-checkout') + '       - Don\'t checkout HEAD after clone');
  console.log('  ' + chalk.green('-h, --help') + '              - Show detailed help information\n');
  
  console.log(chalk.cyan('Advanced Options:'));
  console.log('  ' + chalk.green('--bare') + '                  - Create bare repository (no working directory)');
  console.log('  ' + chalk.green('--mirror') + '                - Create mirror repository (includes all refs)');
  console.log('  ' + chalk.green('--origin <name>') + '         - Use custom name for remote (default: origin)');
  console.log('  ' + chalk.green('--template <dir>') + '        - Use custom template directory');
  console.log('  ' + chalk.green('--reference <repo>') + '      - Reference local repository for objects');
  console.log('  ' + chalk.green('--dissociate') + '            - Dissociate from reference repositories');
  console.log('  ' + chalk.green('--separate-git-dir <dir>') + ' - Store .git directory separately');
  console.log('  ' + chalk.green('--config <key=value>') + '    - Set repository configuration');
  console.log('  ' + chalk.green('--server-option <option>') + ' - Pass option to remote server');
  console.log('  ' + chalk.green('--filter <filter-spec>') + '  - Object filtering for partial clone\n');
  
  console.log(chalk.cyan('URL Formats Supported:'));
  console.log('  ' + chalk.white('GitHub Shorthand:') + '  user/repo → https://github.com/user/repo.git');
  console.log('  ' + chalk.white('HTTPS:') + '             https://github.com/user/repo.git');
  console.log('  ' + chalk.white('SSH:') + '               git@github.com:user/repo.git');
  console.log('  ' + chalk.white('Git Protocol:') + '      git://github.com/user/repo.git');
  console.log('  ' + chalk.white('Local Path:') + '        /path/to/repository.git\n');
  
  console.log(chalk.cyan('Common Use Cases:'));
  console.log(chalk.white('  gclone facebook/react') + '           # Clone React from GitHub');
  console.log(chalk.white('  gclone user/repo my-project') + '     # Clone to specific directory');
  console.log(chalk.white('  gclone user/repo --branch dev') + '   # Clone only dev branch');
  console.log(chalk.white('  gclone user/repo --depth 1') + '      # Fast single-commit clone');
  console.log(chalk.white('  gclone user/repo --depth 10') + '     # Clone with limited history');
  console.log(chalk.white('  gclone --bare server.git') + '        # Create bare repository');
  console.log(chalk.white('  gclone --recurse-submodules') + '     # Clone with all submodules');
  console.log(chalk.white('  gclone --mirror backup.git') + '      # Create complete mirror\n');
  
  console.log(chalk.cyan('� Clone Strategy Tips:'));
  console.log('  • Use ' + chalk.yellow('--depth 1') + ' for faster downloads when history isn\'t needed');
  console.log('  • Use ' + chalk.yellow('--single-branch') + ' to save bandwidth and space');
  console.log('  • Use ' + chalk.yellow('--recurse-submodules') + ' for projects with dependencies');
  console.log('  • GitHub shorthand (user/repo) automatically uses HTTPS');
  console.log('  • ' + chalk.yellow('--bare') + ' repositories are ideal for servers');
  console.log('  • ' + chalk.yellow('--mirror') + ' creates exact replica including all refs\n');
  
  console.log(chalk.cyan('⚠️  Important Notes:'));
  console.log('  • Depth-limited clones cannot be pushed to in some scenarios');
  console.log('  • Use ' + chalk.yellow('git fetch --unshallow') + ' to convert shallow clone to full');
  console.log('  • Bare repositories have no working directory');
  console.log('  • Mirror clones include all branches, tags, and refs');
  console.log('\n' + chalk.gray('═'.repeat(60)));
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
    // Parse arguments
    let repoUrl = '';
    let customDir = '';
    let branch = null;
    let depth = null;
    let jobs = null;
    let origin = 'origin';
    let template = null;
    let reference = null;
    let separateGitDir = null;
    let config = [];
    let serverOptions = [];
    let filter = null;
    
    // Flags
    let singleBranch = false;
    let noSingleBranch = false;
    let recurseSubmodules = false;
    let shallowSubmodules = false;
    let verbose = false;
    let quiet = false;
    let noCheckout = false;
    let bare = false;
    let mirror = false;
    let dissociate = false;
    
    // Parse command line arguments
    let i = 0;
    while (i < args.length) {
      const arg = args[i];
      
      if (arg.startsWith('-')) {
        switch (arg) {
          case '--branch':
          case '-b':
            branch = args[++i];
            break;
          case '--depth':
            depth = parseInt(args[++i]);
            break;
          case '--jobs':
          case '-j':
            jobs = parseInt(args[++i]);
            break;
          case '--origin':
            origin = args[++i];
            break;
          case '--template':
            template = args[++i];
            break;
          case '--reference':
            reference = args[++i];
            break;
          case '--separate-git-dir':
            separateGitDir = args[++i];
            break;
          case '--config':
            config.push(args[++i]);
            break;
          case '--server-option':
            serverOptions.push(args[++i]);
            break;
          case '--filter':
            filter = args[++i];
            break;
          case '--single-branch':
            singleBranch = true;
            break;
          case '--no-single-branch':
            noSingleBranch = true;
            break;
          case '--recurse-submodules':
            recurseSubmodules = true;
            break;
          case '--shallow-submodules':
            shallowSubmodules = true;
            break;
          case '--verbose':
          case '-v':
            verbose = true;
            break;
          case '--quiet':
          case '-q':
            quiet = true;
            break;
          case '--no-checkout':
          case '-n':
            noCheckout = true;
            break;
          case '--bare':
            bare = true;
            break;
          case '--mirror':
            mirror = true;
            break;
          case '--dissociate':
            dissociate = true;
            break;
          default:
            // Skip unknown options
            break;
        }
      } else {
        // First non-option argument is the URL, second is the directory
        if (!repoUrl) {
          repoUrl = arg;
        } else if (!customDir) {
          customDir = arg;
        }
      }
      i++;
    }
    
    // Parse repository URL
    const repo = parseRepoUrl(repoUrl);
    if (!repo) {
      console.log(chalk.red('❌ Invalid repository URL format'));
      console.log(chalk.yellow('💡 Use: user/repo, https://github.com/user/repo.git, or git@github.com:user/repo.git'));
      process.exit(1);
    }
    
    // Determine target directory
    const targetDir = customDir || repo.name;
    if (!targetDir && !bare && !mirror) {
      console.log(chalk.red('❌ Could not determine directory name'));
      console.log(chalk.yellow('💡 Please specify a directory name: gclone <url> <directory>'));
      process.exit(1);
    }
    
    console.log(chalk.magenta.bold('\n📥 Git Repository Clone'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.blue('🌐 Repository:'), chalk.white(repo.original));
    if (targetDir) console.log(chalk.blue('📁 Directory:'), chalk.white(targetDir));
    if (branch) console.log(chalk.blue('🌿 Branch:'), chalk.white(branch));
    if (depth) console.log(chalk.blue('📊 Depth:'), chalk.white(`${depth} commits`));
    if (bare) console.log(chalk.blue('📦 Type:'), chalk.white('Bare repository'));
    if (mirror) console.log(chalk.blue('📦 Type:'), chalk.white('Mirror repository'));
    if (recurseSubmodules) console.log(chalk.blue('🔗 Submodules:'), chalk.white('Included'));
    
    // Check if directory already exists (skip for bare/mirror)
    if (targetDir && !bare && !mirror) {
      const dirCheck = checkDirectory(targetDir);
      if (dirCheck.exists && !dirCheck.empty) {
        console.log(chalk.red(`❌ Directory "${targetDir}" already exists and is not empty`));
        console.log(chalk.yellow('💡 Choose a different directory name or remove existing directory'));
        process.exit(1);
      }
    }
    
    // Build clone command
    let cloneCommand = `git clone`;
    
    // Add options to command
    if (branch) {
      cloneCommand += ` --branch ${branch}`;
    }
    
    if (depth) {
      cloneCommand += ` --depth ${depth}`;
    }
    
    if (singleBranch && !noSingleBranch) {
      cloneCommand += ` --single-branch`;
    } else if (noSingleBranch) {
      cloneCommand += ` --no-single-branch`;
    }
    
    if (recurseSubmodules) {
      cloneCommand += ` --recurse-submodules`;
    }
    
    if (shallowSubmodules) {
      cloneCommand += ` --shallow-submodules`;
    }
    
    if (jobs) {
      cloneCommand += ` --jobs ${jobs}`;
    }
    
    if (verbose) {
      cloneCommand += ` --verbose`;
    }
    
    if (quiet) {
      cloneCommand += ` --quiet`;
    }
    
    if (noCheckout) {
      cloneCommand += ` --no-checkout`;
    }
    
    if (bare) {
      cloneCommand += ` --bare`;
    }
    
    if (mirror) {
      cloneCommand += ` --mirror`;
    }
    
    if (origin !== 'origin') {
      cloneCommand += ` --origin ${origin}`;
    }
    
    if (template) {
      cloneCommand += ` --template "${template}"`;
    }
    
    if (reference) {
      cloneCommand += ` --reference "${reference}"`;
    }
    
    if (dissociate) {
      cloneCommand += ` --dissociate`;
    }
    
    if (separateGitDir) {
      cloneCommand += ` --separate-git-dir "${separateGitDir}"`;
    }
    
    // Add config options
    config.forEach(cfg => {
      cloneCommand += ` --config "${cfg}"`;
    });
    
    // Add server options
    serverOptions.forEach(opt => {
      cloneCommand += ` --server-option "${opt}"`;
    });
    
    if (filter) {
      cloneCommand += ` --filter "${filter}"`;
    }
    
    // Add URL and target directory
    cloneCommand += ` ${repo.https}`;
    if (targetDir) {
      cloneCommand += ` ${targetDir}`;
    }
    
    console.log(chalk.blue('\n📦 Cloning repository...'));
    if (verbose) {
      console.log(chalk.gray('Command:'), cloneCommand);
    }
    
    // Execute clone command
    runGitCommand(cloneCommand, `Repository cloned successfully${targetDir ? ' to ' + targetDir : ''}`);
    
    // Post-clone setup (skip for bare/mirror)
    if (!bare && !mirror && targetDir) {
      console.log(chalk.blue('\n🔧 Post-clone information...'));
      
      // Change to the cloned directory and get basic info
      const originalDir = process.cwd();
      try {
        process.chdir(targetDir);
        
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        const remoteUrl = execSync(`git remote get-url ${origin}`, { encoding: 'utf8' }).trim();
        const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
        
        console.log(chalk.green('✅ Repository information:'));
        console.log(chalk.gray(`   • Current branch: ${chalk.white(currentBranch)}`));
        console.log(chalk.gray(`   • Remote ${origin}: ${chalk.white(remoteUrl)}`));
        console.log(chalk.gray(`   • Commits: ${chalk.white(commitCount)}`));
        
        // Check for submodules
        if (fs.existsSync('.gitmodules')) {
          console.log(chalk.blue('🔗 Submodules detected'));
          if (!recurseSubmodules) {
            console.log(chalk.yellow('💡 Use --recurse-submodules to clone submodules'));
          }
        }
        
        // Check for common project files
        const projectFiles = ['package.json', 'README.md', 'Cargo.toml', 'requirements.txt', 'pom.xml', 'Makefile', 'CMakeLists.txt'];
        const foundFiles = projectFiles.filter(file => fs.existsSync(file));
        
        if (foundFiles.length > 0) {
          console.log(chalk.blue('📄 Project files found:'), chalk.white(foundFiles.join(', ')));
        }
        
        // Check for large files or LFS
        try {
          const lfsFiles = execSync('git lfs ls-files 2>/dev/null || true', { encoding: 'utf8' });
          if (lfsFiles.trim()) {
            console.log(chalk.blue('📦 Git LFS files detected'));
          }
        } catch (e) {
          // LFS not installed or no LFS files
        }
        
      } catch (error) {
        console.log(chalk.yellow('⚠️ Could not gather additional repository information'));
      } finally {
        process.chdir(originalDir);
      }
    }
    
    console.log(chalk.green.bold('\n🎉 Clone completed successfully!'));
    
    if (!bare && !mirror && targetDir) {
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.gray(`   • Navigate to directory: ${chalk.green(`cd ${targetDir}`)}`));
      console.log(chalk.gray(`   • Check repository status: ${chalk.green('gstatus')}`));
      console.log(chalk.gray(`   • View recent commits: ${chalk.green('glog')}`));
      console.log(chalk.gray(`   • List branches: ${chalk.green('gbranch --all')}`));
      
      if (fs.existsSync(path.join(targetDir, 'package.json'))) {
        console.log(chalk.gray(`   • Install dependencies: ${chalk.green('npm install')}`));
      }
      
      if (fs.existsSync(path.join(targetDir, 'README.md'))) {
        console.log(chalk.gray(`   • Read documentation: ${chalk.green('cat README.md')}`));
      }
    } else if (bare) {
      console.log(chalk.cyan('\n💡 Bare repository info:'));
      console.log(chalk.gray('   • No working directory created'));
      console.log(chalk.gray('   • Use for server-side or backup purposes'));
      console.log(chalk.gray(`   • Push to this repo: ${chalk.green(`git push ${targetDir || 'repo'}`)}`));
    } else if (mirror) {
      console.log(chalk.cyan('\n💡 Mirror repository info:'));
      console.log(chalk.gray('   • Complete replica with all refs'));
      console.log(chalk.gray('   • Suitable for backups and replication'));
      console.log(chalk.gray('   • Updates with: git remote update'));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Clone operation failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('Repository not found') || error.message.includes('does not exist')) {
      console.log(chalk.yellow('💡 Troubleshooting:'));
      console.log(chalk.yellow('   • Check if the repository URL is correct'));
      console.log(chalk.yellow('   • Verify the repository exists and is accessible'));
      console.log(chalk.yellow('   • For private repos, ensure you have proper access'));
    } else if (error.message.includes('Permission denied') || error.message.includes('authentication')) {
      console.log(chalk.yellow('💡 Authentication issue:'));
      console.log(chalk.yellow('   • Check your SSH keys for SSH URLs'));
      console.log(chalk.yellow('   • Try HTTPS URL instead of SSH'));
      console.log(chalk.yellow('   • Verify your GitHub/GitLab credentials'));
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log(chalk.yellow('💡 Network issue:'));
      console.log(chalk.yellow('   • Check your internet connection'));
      console.log(chalk.yellow('   • Try again in a few moments'));
      console.log(chalk.yellow('   • Check if proxy settings are correct'));
    } else if (error.message.includes('directory not empty')) {
      console.log(chalk.yellow('💡 Directory conflict:'));
      console.log(chalk.yellow('   • Choose a different directory name'));
      console.log(chalk.yellow('   • Remove existing directory contents'));
      console.log(chalk.yellow('   • Use a different path'));
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