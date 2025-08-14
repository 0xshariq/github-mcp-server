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
    console.log(chalk.magenta.bold('\n📝 gadd - Stage Changes\n'));
    console.log(chalk.cyan('Purpose:'), 'Stage changes for commit with pattern support, interactive mode, and comprehensive validation.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gadd [files...] [options]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[files...]') + ' - Optional list of files/directories to stage (defaults to all changes)\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-A, --all') + '              - Add all changes including new files and deletions');
    console.log('  ' + chalk.green('-u, --update') + '           - Add only modified and deleted files (no new files)');
    console.log('  ' + chalk.green('-p, --patch') + '            - Interactive patch mode for selective staging');
    console.log('  ' + chalk.green('-n, --dry-run') + '          - Show what would be added without actually adding');
    console.log('  ' + chalk.green('-v, --verbose') + '          - Show detailed output of what\'s being staged');
    console.log('  ' + chalk.green('-f, --force') + '            - Force add ignored files');
    console.log('  ' + chalk.green('--ignore-errors') + '        - Continue adding even if some files fail');
    console.log('  ' + chalk.green('-h, --help') + '             - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gadd') + '                      # Add all changes');
    console.log(chalk.white('  gadd file.js src/') + '         # Add specific files/directories');
    console.log(chalk.white('  gadd -A') + '                   # Add everything including deletions');
    console.log(chalk.white('  gadd -p') + '                   # Interactive staging');
    console.log(chalk.white('  gadd -n') + '                   # Preview what will be added\n');
    
    console.log(chalk.cyan('💡 Workflow Tips:'));
    console.log('  • Use ' + chalk.yellow('gadd -n') + ' to preview changes before staging');
    console.log('  • Use ' + chalk.yellow('gadd -p') + ' for selective staging');
    console.log('  • Follow with ' + chalk.yellow('gcommit') + ' to create commits');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('📝 Adding Changes'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git add command
    let addCmd = 'git add';
    const files = [];
    
    // Parse options and files
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '-A' || arg === '--all') {
            addCmd += ' --all';
        } else if (arg === '-u' || arg === '--update') {
            addCmd += ' --update';
        } else if (arg === '-p' || arg === '--patch') {
            addCmd += ' --patch';
        } else if (arg === '-n' || arg === '--dry-run') {
            addCmd += ' --dry-run';
        } else if (arg === '-v' || arg === '--verbose') {
            addCmd += ' --verbose';
        } else if (arg === '-f' || arg === '--force') {
            addCmd += ' --force';
        } else if (arg === '--ignore-errors') {
            addCmd += ' --ignore-errors';
        } else if (!arg.startsWith('-')) {
            // Validate file exists
            if (existsSync(arg)) {
                files.push(arg);
            } else {
                console.warn(chalk.yellow(`⚠️  Warning: File not found: ${arg}`));
            }
        }
        i++;
    }
    
    // Add files to command
    if (files.length > 0) {
        addCmd += ' ' + files.map(f => `"${f}"`).join(' ');
    } else if (!args.includes('-A') && !args.includes('--all') && !args.includes('-u') && !args.includes('--update')) {
        // Default to adding all changes if no specific files or flags
        addCmd += ' .';
    }
    
    console.log(chalk.cyan(`🔍 Running: ${addCmd}`));
    
    // Show what will be added (if not dry-run)
    if (!args.includes('-n') && !args.includes('--dry-run') && !args.includes('-p')) {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf-8' });
            if (status.trim()) {
                console.log(chalk.cyan('\n📋 Files to be staged:'));
                const statusLines = status.trim().split('\n');
                statusLines.forEach(line => {
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
                    } else if (status.includes('?')) {
                        statusColor = chalk.magenta;
                        statusIcon = '❓';
                    }
                    
                    console.log(`  ${statusIcon} ${statusColor(file)} ${chalk.gray(`(${status.trim()})`)}`);
                });
                console.log();
            }
        } catch (e) {
            // Ignore status errors
        }
    }
    
    try {
        const result = execSync(addCmd, { encoding: 'utf-8' });
        
        if (args.includes('-n') || args.includes('--dry-run')) {
            console.log(result);
        } else if (args.includes('-v') || args.includes('--verbose')) {
            console.log(result);
        }
        
        // Show success message
        if (!args.includes('-n') && !args.includes('--dry-run')) {
            console.log(chalk.green('✅ Changes staged successfully'));
            
            // Show next steps
            console.log(chalk.gray('━'.repeat(40)));
            console.log(chalk.cyan('💡 Next Steps:'));
            console.log(chalk.white('  gstatus') + '               # Check current status');
            console.log(chalk.white('  gcommit "message"') + '      # Commit staged changes');
            console.log(chalk.white('  gflow "message"') + '        # Complete workflow (commit + push)');
        }
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}