#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';

function validateRepository() {
    if (!existsSync('.git')) {
        console.error(chalk.red('❌ Error: Not a git repository (or any of the parent directories): .git'));
        process.exit(1);
    }
}

function showHelp() {
    console.log(chalk.magenta.bold('\n🔀 gcheckout - Branch Switching\n'));
    console.log(chalk.cyan('Purpose:'), 'Switch branches, create new branches, and restore files with comprehensive checkout options.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gcheckout [branch|commit|file] [options]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[branch]') + '  - Branch name to switch to');
    console.log('  ' + chalk.white('[commit]') + '  - Commit hash to checkout (detached HEAD)');
    console.log('  ' + chalk.white('[file]') + '    - File path to restore\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-b, --create') + '          - Create and switch to new branch');
    console.log('  ' + chalk.green('-B, --force-create') + '    - Create/reset and switch to branch');
    console.log('  ' + chalk.green('-t, --track') + '           - Set up tracking when creating branch');
    console.log('  ' + chalk.green('--no-track') + '            - Don\'t set up tracking');
    console.log('  ' + chalk.green('-f, --force') + '           - Force checkout (discard local changes)');
    console.log('  ' + chalk.green('-m, --merge') + '           - 3-way merge between current, target, and common base');
    console.log('  ' + chalk.green('--conflict <style>') + '    - Set conflict resolution style (merge, diff3)');
    console.log('  ' + chalk.green('-p, --patch') + '           - Interactive patch mode');
    console.log('  ' + chalk.green('--detach') + '              - Detach HEAD at named commit');
    console.log('  ' + chalk.green('--orphan') + '              - Create orphaned branch');
    console.log('  ' + chalk.green('--ignore-skip-worktree') + ' - Don\'t limit to sparse-checkout');
    console.log('  ' + chalk.green('-q, --quiet') + '           - Suppress feedback messages');
    console.log('  ' + chalk.green('--progress') + '            - Show progress information');
    console.log('  ' + chalk.green('-h, --help') + '            - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gcheckout main') + '             # Switch to main branch');
    console.log(chalk.white('  gcheckout -b feature-auth') + '  # Create and switch to new branch');
    console.log(chalk.white('  gcheckout -t origin/develop') + ' # Track remote branch');
    console.log(chalk.white('  gcheckout HEAD~2') + '           # Go to 2 commits back');
    console.log(chalk.white('  gcheckout --detach v1.0') + '    # Detached HEAD at tag');
    console.log(chalk.white('  gcheckout -- file.js') + '       # Restore file from HEAD');
    console.log(chalk.white('  gcheckout --orphan gh-pages') + ' # Create orphaned branch\n');
    
    console.log(chalk.cyan('⚠️  Safety Notes:'));
    console.log('  • Use ' + chalk.yellow('--force') + ' carefully - it discards uncommitted changes');
    console.log('  • Detached HEAD state means you\'re not on any branch');
    console.log('  • Use ' + chalk.yellow('gstash') + ' to save changes before switching');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch (error) {
        return null;
    }
}

function hasUncommittedChanges() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf-8' });
        return status.trim().length > 0;
    } catch (error) {
        return false;
    }
}

function branchExists(branchName) {
    try {
        execSync(`git rev-parse --verify ${branchName}`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('🔀 Branch Switching'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git checkout command
    let checkoutCmd = 'git checkout';
    let target = '';
    let isCreating = false;
    
    // Parse arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '-b' || arg === '--create') {
            checkoutCmd += ' -b';
            isCreating = true;
        } else if (arg === '-B' || arg === '--force-create') {
            checkoutCmd += ' -B';
            isCreating = true;
        } else if (arg === '-t' || arg === '--track') {
            checkoutCmd += ' --track';
        } else if (arg === '--no-track') {
            checkoutCmd += ' --no-track';
        } else if (arg === '-f' || arg === '--force') {
            checkoutCmd += ' --force';
        } else if (arg === '-m' || arg === '--merge') {
            checkoutCmd += ' --merge';
        } else if (arg === '--conflict') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                checkoutCmd += ` --conflict=${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (arg === '-p' || arg === '--patch') {
            checkoutCmd += ' --patch';
        } else if (arg === '--detach') {
            checkoutCmd += ' --detach';
        } else if (arg === '--orphan') {
            checkoutCmd += ' --orphan';
            isCreating = true;
        } else if (arg === '--ignore-skip-worktree') {
            checkoutCmd += ' --ignore-skip-worktree-bits';
        } else if (arg === '-q' || arg === '--quiet') {
            checkoutCmd += ' --quiet';
        } else if (arg === '--progress') {
            checkoutCmd += ' --progress';
        } else if (!arg.startsWith('-')) {
            target = arg;
        }
        i++;
    }
    
    if (!target) {
        console.error(chalk.red('❌ Error: Branch, commit, or file name required'));
        console.log(chalk.yellow('💡 Usage: gcheckout <branch-name> [options]'));
        console.log(chalk.yellow('💡 Or: gcheckout -b <new-branch-name>'));
        process.exit(1);
    }
    
    checkoutCmd += ` ${target}`;
    
    // Show current state
    const currentBranch = getCurrentBranch();
    if (currentBranch) {
        console.log(chalk.cyan(`📍 Current branch: ${chalk.white(currentBranch)}`));
    }
    
    // Check for uncommitted changes (unless using --force)
    if (!args.includes('-f') && !args.includes('--force') && hasUncommittedChanges()) {
        console.log(chalk.yellow('⚠️  You have uncommitted changes in your working directory:'));
        
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf-8' });
            const changes = status.trim().split('\n').slice(0, 5);
            changes.forEach(change => {
                const file = change.substring(3);
                const status = change.substring(0, 2);
                let statusIcon = '📄';
                if (status.includes('M')) statusIcon = '✏️';
                else if (status.includes('A')) statusIcon = '➕';
                else if (status.includes('D')) statusIcon = '➖';
                
                console.log(`  ${statusIcon} ${chalk.white(file)}`);
            });
            
            if (status.split('\n').length > 5) {
                console.log(`  ${chalk.gray('... and more')}`);
            }
        } catch (e) {
            // Ignore error
        }
        
        console.log(chalk.yellow('\n💡 Options:'));
        console.log(chalk.white('  gstash') + '                    # Stash changes');
        console.log(chalk.white('  gcheckout --force ' + target) + '   # Force checkout (discard changes)');
        console.log(chalk.white('  gcommit -a "WIP"') + '          # Commit changes first');
        
        if (!args.includes('--merge')) {
            console.log(chalk.yellow('\nℹ️  Add --merge to attempt 3-way merge, or --force to discard changes'));
            process.exit(1);
        }
    }
    
    // Check if branch exists (for non-creating operations)
    if (!isCreating && !branchExists(target)) {
        // Check if it's a remote branch
        try {
            const remoteBranches = execSync('git branch -r', { encoding: 'utf-8' });
            const remoteMatch = remoteBranches.split('\n').find(line => 
                line.trim().endsWith('/' + target) || line.includes('origin/' + target)
            );
            
            if (remoteMatch) {
                console.log(chalk.yellow(`💡 Branch '${target}' not found locally, but exists remotely.`));
                console.log(chalk.white(`    Try: gcheckout -t origin/${target}`));
                process.exit(1);
            }
        } catch (e) {
            // Ignore error
        }
        
        console.log(chalk.yellow(`⚠️  Branch '${target}' does not exist locally.`));
        console.log(chalk.yellow(`💡 Create it with: gcheckout -b ${target}`));
        process.exit(1);
    }
    
    console.log(chalk.cyan(`🔍 Running: ${checkoutCmd}`));
    
    try {
        const result = execSync(checkoutCmd, { encoding: 'utf-8' });
        if (result && !args.includes('-q') && !args.includes('--quiet')) {
            console.log(result);
        }
        
        const newBranch = getCurrentBranch();
        if (newBranch) {
            if (isCreating) {
                console.log(chalk.green(`✅ Created and switched to branch '${newBranch}'`));
            } else {
                console.log(chalk.green(`✅ Switched to branch '${newBranch}'`));
            }
        } else {
            console.log(chalk.green('✅ Checkout completed successfully'));
            if (args.includes('--detach')) {
                console.log(chalk.yellow('ℹ️  You are now in detached HEAD state'));
            }
        }
        
        // Show next steps
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Next Steps:'));
        console.log(chalk.white('  gstatus') + '                 # Check current status');
        console.log(chalk.white('  gbranch') + '                 # View all branches');
        if (newBranch && newBranch !== currentBranch) {
            console.log(chalk.white('  glog -n 3') + '               # View recent commits');
        }
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        
        // Common error suggestions
        if (error.message.includes('pathspec')) {
            console.log(chalk.yellow(`💡 Branch '${target}' does not exist. Create it with: gcheckout -b ${target}`));
        } else if (error.message.includes('would be overwritten')) {
            console.log(chalk.yellow('💡 Use gstash to save changes, or --force to discard them'));
        } else if (error.message.includes('already exists')) {
            console.log(chalk.yellow('💡 Use gcheckout without -b to switch to existing branch'));
        }
        
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
