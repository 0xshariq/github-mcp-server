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
    console.log(chalk.magenta.bold('\n💾 gcommit - Commit Changes\n'));
    console.log(chalk.cyan('Purpose:'), 'Create commits with comprehensive options for message handling, staging, and commit modifications.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gcommit [message] [options]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[message]') + ' - Commit message (required unless using -m or --amend)\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-m, --message <msg>') + '     - Use given message as commit message');
    console.log('  ' + chalk.green('-a, --all') + '              - Stage all modified files and commit');
    console.log('  ' + chalk.green('--amend') + '                - Amend the last commit');
    console.log('  ' + chalk.green('--no-edit') + '              - Use previous commit message (with --amend)');
    console.log('  ' + chalk.green('-s, --signoff') + '          - Add Signed-off-by line');
    console.log('  ' + chalk.green('--author <author>') + '       - Override commit author');
    console.log('  ' + chalk.green('--date <date>') + '          - Override commit date');
    console.log('  ' + chalk.green('-n, --no-verify') + '        - Skip pre-commit and commit-msg hooks');
    console.log('  ' + chalk.green('--allow-empty') + '          - Allow empty commits');
    console.log('  ' + chalk.green('--allow-empty-message') + '  - Allow commits with empty messages');
    console.log('  ' + chalk.green('-v, --verbose') + '          - Show unified diff in commit message editor');
    console.log('  ' + chalk.green('-h, --help') + '             - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gcommit "fix: resolve login bug"') + ' # Standard commit');
    console.log(chalk.white('  gcommit -a "feat: add new feature"') + ' # Stage all and commit');
    console.log(chalk.white('  gcommit --amend') + '                  # Amend last commit');
    console.log(chalk.white('  gcommit -s "docs: update README"') + ' # Add signoff');
    console.log(chalk.white('  gcommit --allow-empty "trigger CI"') + ' # Empty commit\n');
    
    console.log(chalk.cyan('💡 Workflow Tips:'));
    console.log('  • Use conventional commits: ' + chalk.yellow('feat:'), chalk.yellow('fix:'), chalk.yellow('docs:'), chalk.yellow('style:'));
    console.log('  • Follow with ' + chalk.yellow('gpush') + ' to upload changes');
    console.log('  • Use ' + chalk.yellow('gcommit --amend') + ' to fix the last commit');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('💾 Committing Changes'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git commit command
    let commitCmd = 'git commit';
    let message = '';
    
    // Parse options and message
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '-m' || arg === '--message') {
            if (args[i + 1]) {
                message = args[i + 1];
                commitCmd += ` -m "${message}"`;
                i++; // Skip next argument as it's the message
            }
        } else if (arg === '-a' || arg === '--all') {
            commitCmd += ' --all';
        } else if (arg === '--amend') {
            commitCmd += ' --amend';
        } else if (arg === '--no-edit') {
            commitCmd += ' --no-edit';
        } else if (arg === '-s' || arg === '--signoff') {
            commitCmd += ' --signoff';
        } else if (arg === '--author') {
            if (args[i + 1]) {
                commitCmd += ` --author="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg === '--date') {
            if (args[i + 1]) {
                commitCmd += ` --date="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg === '-n' || arg === '--no-verify') {
            commitCmd += ' --no-verify';
        } else if (arg === '--allow-empty') {
            commitCmd += ' --allow-empty';
        } else if (arg === '--allow-empty-message') {
            commitCmd += ' --allow-empty-message';
        } else if (arg === '-v' || arg === '--verbose') {
            commitCmd += ' --verbose';
        } else if (!arg.startsWith('-') && !message && !args.includes('-m') && !args.includes('--message')) {
            // First non-option argument is the message (if not using -m)
            message = arg;
            commitCmd += ` -m "${message}"`;
        }
        i++;
    }
    
    // Check if message is required
    if (!message && !args.includes('--amend') && !args.includes('--allow-empty-message')) {
        console.error(chalk.red('❌ Error: Commit message is required'));
        console.log(chalk.yellow('💡 Usage: gcommit "your message" or gcommit -m "your message"'));
        process.exit(1);
    }
    
    // Show what will be committed (if not amending)
    if (!args.includes('--amend')) {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf-8' });
            const cachedChanges = status.split('\n').filter(line => line && (line[0] !== ' ' && line[0] !== '?'));
            
            if (cachedChanges.length > 0) {
                console.log(chalk.cyan('📋 Files to be committed:'));
                cachedChanges.forEach(line => {
                    const status = line.substring(0, 2);
                    const file = line.substring(3);
                    let statusColor = chalk.white;
                    let statusIcon = '📄';
                    
                    if (status.includes('M')) {
                        statusColor = chalk.yellow;
                        statusIcon = '✏️';
                    } else if (status.includes('A')) {
                        statusColor = chalk.green;
                        statusIcon = '➕';
                    } else if (status.includes('D')) {
                        statusColor = chalk.red;
                        statusIcon = '➖';
                    } else if (status.includes('R')) {
                        statusColor = chalk.blue;
                        statusIcon = '🔄';
                    }
                    
                    console.log(`  ${statusIcon} ${statusColor(file)}`);
                });
                console.log();
            } else if (!args.includes('--allow-empty') && !args.includes('-a') && !args.includes('--all')) {
                console.error(chalk.red('❌ Error: No staged changes to commit'));
                console.log(chalk.yellow('💡 Use gadd to stage files first, or use -a to stage all changes, or --allow-empty for empty commit'));
                process.exit(1);
            }
        } catch (e) {
            // Ignore status check errors
        }
    }
    
    console.log(chalk.cyan(`🔍 Running: ${commitCmd}`));
    
    try {
        const result = execSync(commitCmd, { encoding: 'utf-8' });
        console.log(result);
        
        console.log(chalk.green('✅ Commit created successfully'));
        
        // Show next steps
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Next Steps:'));
        console.log(chalk.white('  gstatus') + '                 # Check current status');
        console.log(chalk.white('  glog -n 3') + '               # View recent commits');
        console.log(chalk.white('  gpush') + '                   # Push to remote repository');
        console.log(chalk.white('  gflow "next message"') + '     # Continue with workflow');
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
 