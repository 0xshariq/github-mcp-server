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
    console.log(chalk.magenta.bold('\n🌿 gbranch - Branch Management\n'));
    console.log(chalk.cyan('Purpose:'), 'List, create, and manage branches with comprehensive options for local and remote branches.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gbranch [branch-name] [options]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[branch-name]') + ' - Name of new branch to create\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-r, --remotes') + '         - List remote branches');
    console.log('  ' + chalk.green('-a, --all') + '             - List both local and remote branches');
    console.log('  ' + chalk.green('-v, --verbose') + '         - Show commit info for each branch');
    console.log('  ' + chalk.green('--merged [commit]') + '     - List branches merged into commit');
    console.log('  ' + chalk.green('--no-merged [commit]') + '  - List branches not merged into commit');
    console.log('  ' + chalk.green('--contains <commit>') + '   - List branches containing the commit');
    console.log('  ' + chalk.green('--sort <key>') + '          - Sort by key (committerdate, authordate, etc.)');
    console.log('  ' + chalk.green('-d, --delete') + '          - Delete branch (safe)');
    console.log('  ' + chalk.green('-D, --force-delete') + '    - Force delete branch');
    console.log('  ' + chalk.green('-m, --move') + '            - Rename/move branch');
    console.log('  ' + chalk.green('-c, --copy') + '            - Copy branch');
    console.log('  ' + chalk.green('--track') + '               - Set up tracking when creating');
    console.log('  ' + chalk.green('--no-track') + '            - Don\'t set up tracking');
    console.log('  ' + chalk.green('-h, --help') + '            - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gbranch') + '                     # List local branches');
    console.log(chalk.white('  gbranch feature-auth') + '        # Create new branch');
    console.log(chalk.white('  gbranch -a') + '                  # List all branches');
    console.log(chalk.white('  gbranch -r') + '                  # List remote branches');
    console.log(chalk.white('  gbranch -v') + '                  # Verbose branch list');
    console.log(chalk.white('  gbranch --merged') + '            # Show merged branches');
    console.log(chalk.white('  gbranch -d old-feature') + '      # Delete branch safely');
    console.log(chalk.white('  gbranch --sort=-committerdate') + ' # Sort by recent commits\n');
    
    console.log(chalk.cyan('🔧 Branch Management:'));
    console.log('  • Use ' + chalk.yellow('gcheckout') + ' to switch between branches');
    console.log('  • Current branch is highlighted with ' + chalk.green('*') + ' and color');
    console.log('  • Remote tracking information shown when available');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch (error) {
        return null;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('🌿 Branch Management'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git branch command
    let branchCmd = 'git branch';
    let branchName = '';
    let action = 'list';
    
    // Parse arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '-r' || arg === '--remotes') {
            branchCmd += ' --remotes';
        } else if (arg === '-a' || arg === '--all') {
            branchCmd += ' --all';
        } else if (arg === '-v' || arg === '--verbose') {
            branchCmd += ' --verbose';
        } else if (arg === '--merged') {
            branchCmd += ' --merged';
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                branchCmd += ` ${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (arg === '--no-merged') {
            branchCmd += ' --no-merged';
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                branchCmd += ` ${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (arg === '--contains') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                branchCmd += ` --contains ${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (arg === '--sort') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                branchCmd += ` --sort=${args[i + 1]}`;
                i++; // Skip next argument
            }
        } else if (arg === '-d' || arg === '--delete') {
            action = 'delete';
            branchCmd = 'git branch --delete';
        } else if (arg === '-D' || arg === '--force-delete') {
            action = 'force-delete';
            branchCmd = 'git branch --delete --force';
        } else if (arg === '-m' || arg === '--move') {
            action = 'move';
            branchCmd = 'git branch --move';
        } else if (arg === '-c' || arg === '--copy') {
            action = 'copy';
            branchCmd = 'git branch --copy';
        } else if (arg === '--track') {
            branchCmd += ' --track';
        } else if (arg === '--no-track') {
            branchCmd += ' --no-track';
        } else if (!arg.startsWith('-')) {
            branchName = arg;
        }
        i++;
    }
    
    // Handle different actions
    if (action === 'list') {
        if (branchName) {
            // Creating a new branch
            branchCmd = `git branch ${branchName}`;
            if (args.includes('--track')) {
                branchCmd += ' --track';
            } else if (args.includes('--no-track')) {
                branchCmd += ' --no-track';
            }
            
            console.log(chalk.cyan(`🔍 Running: ${branchCmd}`));
            
            try {
                const result = execSync(branchCmd, { encoding: 'utf-8' });
                if (result) console.log(result);
                
                console.log(chalk.green(`✅ Branch '${branchName}' created successfully`));
                console.log(chalk.gray('━'.repeat(40)));
                console.log(chalk.cyan('� Next Steps:'));
                console.log(chalk.white(`  gcheckout ${branchName}`) + '      # Switch to new branch');
                console.log(chalk.white('  gbranch') + '                  # View all branches');
                
            } catch (error) {
                console.error(chalk.red(`❌ Error: ${error.message}`));
                if (error.message.includes('already exists')) {
                    console.log(chalk.yellow(`💡 Branch '${branchName}' already exists. Use gcheckout to switch to it.`));
                }
                process.exit(1);
            }
        } else {
            // Listing branches
            console.log(chalk.cyan(`🔍 Running: ${branchCmd}`));
            
            try {
                const result = execSync(branchCmd, { encoding: 'utf-8' });
                
                // Enhanced output formatting for branch listing
                if (result) {
                    const branches = result.split('\n').filter(line => line.trim());
                    const currentBranch = getCurrentBranch();
                    
                    console.log(chalk.cyan('\n📋 Branches:'));
                    branches.forEach(branch => {
                        const cleanBranch = branch.replace(/^\*?\s*/, '');
                        const isCurrent = branch.startsWith('*');
                        
                        if (isCurrent) {
                            console.log(`  ${chalk.green('*')} ${chalk.green.bold(cleanBranch)} ${chalk.gray('(current)')}`);
                        } else if (branch.includes('remotes/')) {
                            console.log(`    ${chalk.blue(cleanBranch)}`);
                        } else {
                            console.log(`    ${chalk.white(cleanBranch)}`);
                        }
                    });
                    
                    console.log(chalk.gray('\n━'.repeat(40)));
                    console.log(chalk.cyan('💡 Branch Tips:'));
                    console.log(chalk.white('  gcheckout <branch>') + '       # Switch to branch');
                    console.log(chalk.white('  gbranch <new-name>') + '       # Create new branch');
                    console.log(chalk.white('  gbranch -a') + '               # Show remote branches');
                }
                
            } catch (error) {
                console.error(chalk.red(`❌ Error: ${error.message}`));
                process.exit(1);
            }
        }
    } else {
        // Delete, move, or copy operations
        if (!branchName) {
            console.error(chalk.red(`❌ Error: Branch name required for ${action} operation`));
            process.exit(1);
        }
        
        branchCmd += ` ${branchName}`;
        
        if (action === 'force-delete') {
            console.log(chalk.red('⚠️  WARNING: Force deleting branch can cause data loss!'));
        }
        
        console.log(chalk.cyan(`🔍 Running: ${branchCmd}`));
        
        try {
            const result = execSync(branchCmd, { encoding: 'utf-8' });
            if (result) console.log(result);
            
            console.log(chalk.green(`✅ Branch ${action} operation completed successfully`));
            
        } catch (error) {
            console.error(chalk.red(`❌ Error: ${error.message}`));
            
            if (action === 'delete' && error.message.includes('not fully merged')) {
                console.log(chalk.yellow('💡 Use gbranch -D to force delete unmerged branch'));
            }
            
            process.exit(1);
        }
    }
    
    console.log(chalk.green('\n✅ Command completed successfully'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
  