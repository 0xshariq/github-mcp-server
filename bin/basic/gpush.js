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
    console.log(chalk.magenta.bold('\n🚀 gpush - Push Changes to Remote\n'));
    console.log(chalk.cyan('Purpose:'), 'Push local commits to remote repository with comprehensive options for branches, tags, and safety.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gpush [remote] [branch] [options]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[remote]') + '  - Remote repository name (default: origin)');
    console.log('  ' + chalk.white('[branch]') + '  - Branch name (default: current branch)\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-u, --set-upstream') + '     - Set upstream for branch');
    console.log('  ' + chalk.green('--force') + '               - Force push (destructive, use with caution)');
    console.log('  ' + chalk.green('--force-with-lease') + '     - Force push with safety checks');
    console.log('  ' + chalk.green('--dry-run') + '             - Show what would be pushed');
    console.log('  ' + chalk.green('--tags') + '               - Push all tags');
    console.log('  ' + chalk.green('--follow-tags') + '         - Push annotated tags reachable from pushed commits');
    console.log('  ' + chalk.green('--all') + '                - Push all branches');
    console.log('  ' + chalk.green('--delete') + '             - Delete remote branch');
    console.log('  ' + chalk.green('-v, --verbose') + '         - Show verbose output');
    console.log('  ' + chalk.green('-q, --quiet') + '           - Suppress output');
    console.log('  ' + chalk.green('--progress') + '            - Show progress information');
    console.log('  ' + chalk.green('-h, --help') + '            - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gpush') + '                      # Push current branch to origin');
    console.log(chalk.white('  gpush -u') + '                   # Set upstream and push');
    console.log(chalk.white('  gpush --force-with-lease') + '   # Safe force push');
    console.log(chalk.white('  gpush --dry-run') + '            # Preview push');
    console.log(chalk.white('  gpush --tags') + '               # Push all tags');
    console.log(chalk.white('  gpush origin main') + '          # Push main branch to origin\n');
    
    console.log(chalk.cyan('⚠️  Safety Notes:'));
    console.log('  • ' + chalk.yellow('--force') + ' can overwrite remote history - use with extreme caution');
    console.log('  • ' + chalk.yellow('--force-with-lease') + ' is safer - checks for remote changes');
    console.log('  • Use ' + chalk.yellow('--dry-run') + ' to preview changes before pushing');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch (error) {
        return 'HEAD';
    }
}

function getRemoteUrl(remote) {
    try {
        return execSync(`git remote get-url ${remote}`, { encoding: 'utf-8' }).trim();
    } catch (error) {
        return null;
    }
}

function hasUpstream(branch) {
    try {
        execSync(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { stdio: 'pipe' });
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
    
    console.log(chalk.magenta.bold('🚀 Pushing Changes to Remote'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git push command
    let pushCmd = 'git push';
    let remote = '';
    let branch = '';
    
    // Parse arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '-u' || arg === '--set-upstream') {
            pushCmd += ' --set-upstream';
        } else if (arg === '--force') {
            pushCmd += ' --force';
        } else if (arg === '--force-with-lease') {
            pushCmd += ' --force-with-lease';
        } else if (arg === '--dry-run') {
            pushCmd += ' --dry-run';
        } else if (arg === '--tags') {
            pushCmd += ' --tags';
        } else if (arg === '--follow-tags') {
            pushCmd += ' --follow-tags';
        } else if (arg === '--all') {
            pushCmd += ' --all';
        } else if (arg === '--delete') {
            pushCmd += ' --delete';
        } else if (arg === '-v' || arg === '--verbose') {
            pushCmd += ' --verbose';
        } else if (arg === '-q' || arg === '--quiet') {
            pushCmd += ' --quiet';
        } else if (arg === '--progress') {
            pushCmd += ' --progress';
        } else if (!arg.startsWith('-')) {
            // First non-option argument is remote, second is branch
            if (!remote) {
                remote = arg;
            } else if (!branch) {
                branch = arg;
            }
        }
        i++;
    }
    
    // Set defaults
    if (!remote && !args.includes('--all')) {
        remote = 'origin';
    }
    if (!branch && !args.includes('--all') && !args.includes('--tags')) {
        branch = getCurrentBranch();
    }
    
    // Add remote and branch to command
    if (remote && branch) {
        pushCmd += ` ${remote} ${branch}`;
    } else if (remote && args.includes('--all')) {
        pushCmd += ` ${remote}`;
    }
    
    // Show repository info
    console.log(chalk.cyan('📂 Repository Information:'));
    if (remote) {
        const remoteUrl = getRemoteUrl(remote);
        if (remoteUrl) {
            console.log(`  Remote (${remote}): ${chalk.white(remoteUrl)}`);
        } else {
            console.error(chalk.red(`❌ Error: Remote '${remote}' not found`));
            process.exit(1);
        }
    }
    
    if (branch) {
        console.log(`  Branch: ${chalk.white(branch)}`);
        
        // Check if branch has upstream
        if (!hasUpstream(branch) && !args.includes('-u') && !args.includes('--set-upstream')) {
            console.log(chalk.yellow('⚠️  Branch has no upstream. Consider using -u to set upstream.'));
        }
    }
    
    // Show what will be pushed (unless quiet or dry-run)
    if (!args.includes('-q') && !args.includes('--quiet') && !args.includes('--dry-run')) {
        try {
            if (branch) {
                const commits = execSync(`git rev-list --oneline ${remote}/${branch}..${branch} 2>/dev/null || git log --oneline -n 5`, { encoding: 'utf-8' });
                if (commits.trim()) {
                    console.log(chalk.cyan('\n📋 Commits to be pushed:'));
                    const commitLines = commits.trim().split('\n').slice(0, 5);
                    commitLines.forEach(line => {
                        const [hash, ...messageParts] = line.split(' ');
                        console.log(`  ${chalk.yellow(hash)} ${messageParts.join(' ')}`);
                    });
                    if (commits.split('\n').length > 5) {
                        console.log(`  ${chalk.gray('... and more')}`);
                    }
                }
            }
        } catch (e) {
            // Ignore error, might be first push
        }
    }
    
    // Force push warning
    if (args.includes('--force')) {
        console.log(chalk.red('\n⚠️  WARNING: Force push can overwrite remote history!'));
        console.log(chalk.yellow('💡 Consider using --force-with-lease for safer force pushing'));
    }
    
    console.log(chalk.cyan(`\n🔍 Running: ${pushCmd}`));
    
    try {
        const result = execSync(pushCmd, { encoding: 'utf-8' });
        console.log(result);
        
        if (args.includes('--dry-run')) {
            console.log(chalk.blue('ℹ️  This was a dry run - no changes were pushed'));
        } else {
            console.log(chalk.green('✅ Push completed successfully'));
        }
        
        // Show next steps
        if (!args.includes('--dry-run')) {
            console.log(chalk.gray('━'.repeat(40)));
            console.log(chalk.cyan('💡 Next Steps:'));
            console.log(chalk.white('  gstatus') + '                 # Check current status');
            console.log(chalk.white('  glog -n 3') + '               # View recent commits');
            if (remote && branch) {
                console.log(chalk.white(`  git log ${remote}/${branch}..${branch}`) + ' # Check unpushed commits');
            }
            console.log(chalk.white('  gflow "next message"') + '     # Continue workflow');
        }
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        
        // Common error suggestions
        if (error.message.includes('rejected')) {
            console.log(chalk.yellow('💡 Try: gpull first to fetch remote changes'));
            console.log(chalk.yellow('💡 Or: gpush --force-with-lease (safer than --force)'));
        } else if (error.message.includes('upstream')) {
            console.log(chalk.yellow('💡 Try: gpush -u to set upstream branch'));
        }
        
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}