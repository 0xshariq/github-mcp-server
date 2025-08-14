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
    console.log(chalk.magenta.bold('\n📜 glog - View Commit History\n'));
    console.log(chalk.cyan('Purpose:'), 'Display commit history with various formatting options, filtering, and graph visualization.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('glog [options] [revision-range] [-- paths...]\n'));
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-n<number>, --max-count=<number>') + ' - Limit number of commits');
    console.log('  ' + chalk.green('--oneline') + '                    - Compact one-line format');
    console.log('  ' + chalk.green('--graph') + '                     - Show ASCII graph of branches');
    console.log('  ' + chalk.green('--all') + '                       - Show all branches');
    console.log('  ' + chalk.green('--decorate') + '                  - Show branch and tag names');
    console.log('  ' + chalk.green('--stat') + '                      - Show diffstat');
    console.log('  ' + chalk.green('--shortstat') + '                 - Show summary diffstat');
    console.log('  ' + chalk.green('--name-only') + '                 - Show only names of changed files');
    console.log('  ' + chalk.green('--name-status') + '               - Show names and status of changed files');
    console.log('  ' + chalk.green('--abbrev-commit') + '             - Use abbreviated commit hashes');
    console.log('  ' + chalk.green('--no-merges') + '                 - Skip merge commits');
    console.log('  ' + chalk.green('--merges') + '                    - Show only merge commits');
    console.log('  ' + chalk.green('--first-parent') + '              - Follow first parent only');
    console.log('  ' + chalk.green('--reverse') + '                   - Output commits in reverse order');
    console.log('  ' + chalk.green('-p, --patch') + '                 - Show patch (diff) for each commit');
    console.log('  ' + chalk.green('-h, --help') + '                  - Show detailed help information\n');
    
    console.log(chalk.cyan('Filtering Options:'));
    console.log('  ' + chalk.green('--author=<pattern>') + '          - Filter by author');
    console.log('  ' + chalk.green('--committer=<pattern>') + '       - Filter by committer');
    console.log('  ' + chalk.green('--grep=<pattern>') + '            - Filter by commit message');
    console.log('  ' + chalk.green('--since=<date>') + '              - Show commits after date');
    console.log('  ' + chalk.green('--until=<date>') + '              - Show commits before date');
    console.log('  ' + chalk.green('--before=<date>') + '             - Same as --until');
    console.log('  ' + chalk.green('--after=<date>') + '              - Same as --since\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  glog') + '                        # Show recent commits');
    console.log(chalk.white('  glog -n 20') + '                  # Show last 20 commits');
    console.log(chalk.white('  glog --oneline') + '              # Compact view');
    console.log(chalk.white('  glog --graph --all') + '          # Visual branch history');
    console.log(chalk.white('  glog --stat') + '                 # Show file changes');
    console.log(chalk.white('  glog --author="John Doe"') + '    # Commits by author');
    console.log(chalk.white('  glog --since="1 week ago"') + '   # Recent commits');
    console.log(chalk.white('  glog --grep="fix:"') + '          # Search commit messages');
    console.log(chalk.white('  glog main..feature') + '          # Compare branches\n');
    
    console.log(chalk.cyan('📅 Date Formats:'));
    console.log('  • "2024-01-01" or "2024/01/01"');
    console.log('  • "1 week ago", "2 days ago", "3 months ago"');
    console.log('  • "yesterday", "last week"');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('📜 Git Commit History'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git log command
    let logCmd = 'git log';
    let maxCount = 10; // Default
    let hasCustomFormat = false;
    
    // Parse arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg.startsWith('-n') && arg.length > 2) {
            maxCount = parseInt(arg.substring(2));
            logCmd += ` -n ${maxCount}`;
        } else if (arg === '--max-count') {
            if (args[i + 1] && !isNaN(parseInt(args[i + 1]))) {
                maxCount = parseInt(args[i + 1]);
                logCmd += ` --max-count=${maxCount}`;
                i++; // Skip next argument
            }
        } else if (!isNaN(parseInt(arg)) && !arg.startsWith('-')) {
            maxCount = parseInt(arg);
            logCmd += ` -n ${maxCount}`;
        } else if (arg === '--oneline') {
            logCmd += ' --oneline';
            hasCustomFormat = true;
        } else if (arg === '--graph') {
            logCmd += ' --graph';
        } else if (arg === '--all') {
            logCmd += ' --all';
        } else if (arg === '--decorate') {
            logCmd += ' --decorate';
        } else if (arg === '--stat') {
            logCmd += ' --stat';
        } else if (arg === '--shortstat') {
            logCmd += ' --shortstat';
        } else if (arg === '--name-only') {
            logCmd += ' --name-only';
        } else if (arg === '--name-status') {
            logCmd += ' --name-status';
        } else if (arg === '--abbrev-commit') {
            logCmd += ' --abbrev-commit';
        } else if (arg === '--no-merges') {
            logCmd += ' --no-merges';
        } else if (arg === '--merges') {
            logCmd += ' --merges';
        } else if (arg === '--first-parent') {
            logCmd += ' --first-parent';
        } else if (arg === '--reverse') {
            logCmd += ' --reverse';
        } else if (arg === '-p' || arg === '--patch') {
            logCmd += ' --patch';
        } else if (arg.startsWith('--author=')) {
            logCmd += ` "${arg}"`;
        } else if (arg === '--author') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                logCmd += ` --author="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg.startsWith('--committer=')) {
            logCmd += ` "${arg}"`;
        } else if (arg === '--committer') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                logCmd += ` --committer="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg.startsWith('--grep=')) {
            logCmd += ` "${arg}"`;
        } else if (arg === '--grep') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                logCmd += ` --grep="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg.startsWith('--since=') || arg.startsWith('--after=')) {
            logCmd += ` "${arg}"`;
        } else if (arg === '--since' || arg === '--after') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                logCmd += ` ${arg}="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg.startsWith('--until=') || arg.startsWith('--before=')) {
            logCmd += ` "${arg}"`;
        } else if (arg === '--until' || arg === '--before') {
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                logCmd += ` ${arg}="${args[i + 1]}"`;
                i++; // Skip next argument
            }
        } else if (arg === '--') {
            logCmd += ' --';
            // Add remaining arguments as paths
            for (let j = i + 1; j < args.length; j++) {
                logCmd += ` ${args[j]}`;
            }
            break;
        } else if (!arg.startsWith('-')) {
            // Could be revision range or path
            logCmd += ` ${arg}`;
        }
        i++;
    }
    
    // Add default count if not specified and no custom format
    if (!args.some(a => a.startsWith('-n') || a === '--max-count' || !isNaN(parseInt(a))) && !hasCustomFormat) {
        logCmd += ` -n ${maxCount}`;
    }
    
    // Show current context
    try {
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
        if (currentBranch) {
            console.log(chalk.cyan(`📍 Current branch: ${chalk.white(currentBranch)}`));
        }
        
        const totalCommits = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
        console.log(chalk.cyan(`📊 Total commits: ${chalk.white(totalCommits)}`));
        
        if (maxCount && parseInt(totalCommits) > maxCount) {
            console.log(chalk.cyan(`📋 Showing: ${chalk.white(Math.min(maxCount, parseInt(totalCommits)))} most recent commits`));
        }
    } catch (e) {
        // Ignore context errors
    }
    
    console.log(chalk.cyan(`🔍 Running: ${logCmd}`));
    
    try {
        const result = execSync(logCmd, { encoding: 'utf-8' });
        
        if (result.trim()) {
            console.log(result);
        } else {
            console.log(chalk.yellow('ℹ️  No commits found matching the criteria'));
        }
        
        // Show next steps
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Log Navigation:'));
        console.log(chalk.white('  glog -n 20') + '               # Show more commits');
        console.log(chalk.white('  glog --graph --all') + '       # Visual branch history');
        console.log(chalk.white('  glog --stat') + '              # Include file changes');
        console.log(chalk.white('  glog --author="name"') + '     # Filter by author');
        console.log(chalk.white('  gdiff HEAD~1') + '             # Compare with previous commit');
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        
        // Common error suggestions
        if (error.message.includes('bad revision')) {
            console.log(chalk.yellow('💡 Check branch/commit name spelling'));
        } else if (error.message.includes('no commits yet')) {
            console.log(chalk.yellow('💡 Repository has no commits yet'));
            console.log(chalk.yellow('💡 Make your first commit: gcommit "Initial commit"'));
        }
        
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}