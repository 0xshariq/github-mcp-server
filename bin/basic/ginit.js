#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import chalk from 'chalk';

function isGitRepository() {
    return existsSync('.git');
}

function showHelp() {
    console.log(chalk.magenta.bold('\n🎯 ginit - Initialize Repository\n'));
    console.log(chalk.cyan('Purpose:'), 'Initialize a new Git repository with comprehensive options for bare repos, templates, and branch setup.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('ginit [directory] [options]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[directory]') + ' - Directory to initialize (default: current directory)\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('--bare') + '                - Create bare repository');
    console.log('  ' + chalk.green('--template <dir>') + '      - Use custom template directory');
    console.log('  ' + chalk.green('-b, --initial-branch <name>') + ' - Set initial branch name');
    console.log('  ' + chalk.green('--separate-git-dir <dir>') + ' - Separate git directory');
    console.log('  ' + chalk.green('--shared[=<perms>]') + '    - Set repository sharing permissions');
    console.log('  ' + chalk.green('-q, --quiet') + '           - Suppress output messages');
    console.log('  ' + chalk.green('--object-format <format>') + ' - Object format (sha1 or sha256)');
    console.log('  ' + chalk.green('-h, --help') + '            - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  ginit') + '                       # Initialize current directory');
    console.log(chalk.white('  ginit my-project') + '            # Initialize new directory');
    console.log(chalk.white('  ginit --bare server.git') + '     # Create bare repository');
    console.log(chalk.white('  ginit -b main') + '               # Set initial branch to main');
    console.log(chalk.white('  ginit --template ~/.git-template') + ' # Use custom template\n');
    
    console.log(chalk.cyan('📁 What Gets Created:'));
    console.log('  • ' + chalk.white('.git/') + ' directory with repository metadata');
    console.log('  • Initial branch (default: master, or configured default)');
    console.log('  • Basic hooks and configuration files');
    console.log('  • Template files if --template is specified');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    console.log(chalk.magenta.bold('🎯 Git Repository Initialization'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git init command
    let initCmd = 'git init';
    let targetDir = '';
    
    // Parse arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '--bare') {
            initCmd += ' --bare';
        } else if (arg === '--template') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                initCmd += ` --template="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg === '-b' || arg === '--initial-branch') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                initCmd += ` --initial-branch=${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (arg === '--separate-git-dir') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                initCmd += ` --separate-git-dir="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg.startsWith('--shared')) {
            initCmd += ` ${arg}`;
        } else if (arg === '-q' || arg === '--quiet') {
            initCmd += ' --quiet';
        } else if (arg === '--object-format') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                initCmd += ` --object-format=${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (!arg.startsWith('-') && !targetDir) {
            targetDir = arg;
        }
        i++;
    }
    
    // Add target directory to command
    if (targetDir) {
        initCmd += ` "${targetDir}"`;
    }
    
    // Check if already a git repository (only for current directory)
    if (!targetDir && isGitRepository()) {
        console.log(chalk.yellow('⚠️  Current directory is already a Git repository'));
        console.log(chalk.cyan('📂 Repository location: ') + chalk.white('.git/'));
        
        try {
            const remotes = execSync('git remote -v', { encoding: 'utf-8' });
            if (remotes.trim()) {
                console.log(chalk.cyan('🌐 Configured remotes:'));
                remotes.trim().split('\n').forEach(line => {
                    console.log(`  ${chalk.white(line)}`);
                });
            }
        } catch (e) {
            // No remotes configured
        }
        
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Repository Management:'));
        console.log(chalk.white('  gstatus') + '                 # Check current status');
        console.log(chalk.white('  gbranch') + '                 # View branches');
        console.log(chalk.white('  gremote add origin <url>') + ' # Add remote');
        
        return;
    }
    
    console.log(chalk.cyan('📂 Target directory: ') + chalk.white(targetDir || 'current directory'));
    console.log(chalk.cyan(`🔍 Running: ${initCmd}`));
    
    try {
        const result = execSync(initCmd, { encoding: 'utf-8' });
        
        if (result && !args.includes('-q') && !args.includes('--quiet')) {
            console.log(result);
        }
        
        console.log(chalk.green('✅ Git repository initialized successfully'));
        
        // Show repository information
        const repoPath = targetDir || '.';
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('📊 Repository Information:'));
        
        try {
            if (targetDir) {
                process.chdir(targetDir);
            }
            
            const branch = execSync('git branch --show-current 2>/dev/null || echo "HEAD"', { encoding: 'utf-8' }).trim();
            console.log(`  Initial branch: ${chalk.white(branch || 'HEAD')}`);
            
            const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf-8' }).trim();
            console.log(`  Git directory: ${chalk.white(gitDir)}`);
            
            if (args.includes('--bare')) {
                console.log(`  Repository type: ${chalk.yellow('Bare repository (no working directory)')}`);
            } else {
                console.log(`  Repository type: ${chalk.white('Standard repository')}`);
            }
            
        } catch (e) {
            // Ignore info gathering errors
        }
        
        // Show next steps
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Next Steps:'));
        
        if (!args.includes('--bare')) {
            console.log(chalk.white('  echo "# My Project" > README.md') + ' # Create README');
            console.log(chalk.white('  gadd README.md') + '              # Stage the file');
            console.log(chalk.white('  gcommit "Initial commit"') + '    # Make first commit');
            console.log(chalk.white('  gremote add origin <url>') + '    # Add remote repository');
            console.log(chalk.white('  gpush -u origin main') + '        # Push to remote');
        } else {
            console.log(chalk.white('  git clone <path-to-this-repo>') + ' # Clone from this bare repo');
            console.log(chalk.white('  # This bare repo can receive pushes from clones'));
        }
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        
        // Common error suggestions
        if (error.message.includes('already exists')) {
            console.log(chalk.yellow('💡 Directory already contains a Git repository'));
        } else if (error.message.includes('permission denied')) {
            console.log(chalk.yellow('💡 Check directory permissions'));
        }
        
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}