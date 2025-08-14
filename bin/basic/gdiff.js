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
    console.log(chalk.magenta.bold('\n📄 gdiff - Show Differences\n'));
    console.log(chalk.cyan('Purpose:'), 'Display differences between files, commits, branches, and working directory with various formatting options.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gdiff [options] [paths...]\n'));
    
    console.log(chalk.cyan('Parameters:'));
    console.log('  ' + chalk.white('[paths...]') + ' - Optional specific files or paths to compare\n');
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('--staged, --cached') + '    - Show staged changes');
    console.log('  ' + chalk.green('--name-only') + '           - Show only file names that changed');
    console.log('  ' + chalk.green('--name-status') + '         - Show file names and change status');
    console.log('  ' + chalk.green('--stat') + '                - Show statistics (additions/deletions)');
    console.log('  ' + chalk.green('--numstat') + '             - Show numerical statistics');
    console.log('  ' + chalk.green('--shortstat') + '           - Show summary statistics');
    console.log('  ' + chalk.green('--color-words') + '         - Color changed words instead of lines');
    console.log('  ' + chalk.green('-w, --ignore-all-space') + ' - Ignore all whitespace changes');
    console.log('  ' + chalk.green('--ignore-space-change') + '  - Ignore changes in amount of whitespace');
    console.log('  ' + chalk.green('--ignore-blank-lines') + '  - Ignore blank line changes');
    console.log('  ' + chalk.green('-U<num>, --unified=<num>') + ' - Number of context lines');
    console.log('  ' + chalk.green('--no-pager') + '            - Don\'t use pager for output');
    console.log('  ' + chalk.green('--word-diff') + '           - Show word-level differences');
    console.log('  ' + chalk.green('-h, --help') + '            - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gdiff') + '                      # Show unstaged changes');
    console.log(chalk.white('  gdiff --staged') + '             # Show staged changes');
    console.log(chalk.white('  gdiff --stat') + '               # Statistics summary');
    console.log(chalk.white('  gdiff --name-only') + '          # Just file names');
    console.log(chalk.white('  gdiff HEAD~1') + '               # Compare with previous commit');
    console.log(chalk.white('  gdiff main..feature') + '        # Compare branches');
    console.log(chalk.white('  gdiff -- file.js') + '           # Specific file only');
    console.log(chalk.white('  gdiff --color-words') + '        # Word-level changes\n');
    
    console.log(chalk.cyan('💡 Diff Reading Tips:'));
    console.log('  • ' + chalk.green('+') + ' lines are additions');
    console.log('  • ' + chalk.red('-') + ' lines are deletions');
    console.log('  • Use ' + chalk.yellow('--stat') + ' for overview, then specific files');
    console.log('  • ' + chalk.yellow('--color-words') + ' is great for text changes');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('📄 Git Differences'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git diff command
    let diffCmd = 'git diff';
    let target = '';
    let hasFiles = false;
    
    // Parse arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        
        if (arg === '--staged' || arg === '--cached') {
            diffCmd += ' --staged';
        } else if (arg === '--name-only') {
            diffCmd += ' --name-only';
        } else if (arg === '--name-status') {
            diffCmd += ' --name-status';
        } else if (arg === '--stat') {
            diffCmd += ' --stat';
        } else if (arg === '--numstat') {
            diffCmd += ' --numstat';
        } else if (arg === '--shortstat') {
            diffCmd += ' --shortstat';
        } else if (arg === '--color-words') {
            diffCmd += ' --color-words';
        } else if (arg === '-w' || arg === '--ignore-all-space') {
            diffCmd += ' --ignore-all-space';
        } else if (arg === '--ignore-space-change') {
            diffCmd += ' --ignore-space-change';
        } else if (arg === '--ignore-blank-lines') {
            diffCmd += ' --ignore-blank-lines';
        } else if (arg.startsWith('-U') || arg.startsWith('--unified=')) {
            diffCmd += ` ${arg}`;
        } else if (arg === '--no-pager') {
            diffCmd += ' --no-pager';
        } else if (arg === '--word-diff') {
            diffCmd += ' --word-diff';
        } else if (arg === '--') {
            diffCmd += ' --';
            hasFiles = true;
        } else if (!arg.startsWith('-')) {
            if (!target && !hasFiles) {
                target = arg;
                diffCmd += ` ${target}`;
            } else {
                diffCmd += ` ${arg}`;
                hasFiles = true;
            }
        }
        i++;
    }
    
    // Show context information
    try {
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
        if (currentBranch) {
            console.log(chalk.cyan(`📍 Current branch: ${chalk.white(currentBranch)}`));
        }
        
        // Show what we're comparing
        if (args.includes('--staged') || args.includes('--cached')) {
            console.log(chalk.cyan('� Comparing: staged changes vs HEAD'));
        } else if (target) {
            console.log(chalk.cyan(`🔍 Comparing: working directory vs ${chalk.white(target)}`));
        } else {
            console.log(chalk.cyan('🔍 Comparing: working directory vs staged'));
        }
    } catch (e) {
        // Ignore errors
    }
    
    // Check if there are any changes
    try {
        const hasChanges = execSync(diffCmd.replace(' --no-pager', '') + ' --quiet', { stdio: 'pipe' });
    } catch (error) {
        // If git diff --quiet exits with non-zero, there are changes
        if (error.status === 1) {
            // There are changes, proceed
        } else {
            console.error(chalk.red(`❌ Error: ${error.message}`));
            process.exit(1);
        }
    }
    
    console.log(chalk.cyan(`🔍 Running: ${diffCmd}`));
    
    try {
        const result = execSync(diffCmd, { encoding: 'utf-8' });
        
        if (!result.trim()) {
            if (args.includes('--staged') || args.includes('--cached')) {
                console.log(chalk.yellow('ℹ️  No staged changes found'));
                console.log(chalk.gray('💡 Use gadd to stage changes first'));
            } else {
                console.log(chalk.yellow('ℹ️  No changes found'));
                console.log(chalk.gray('💡 Working directory is clean'));
            }
        } else {
            console.log(result);
            
            // Show summary if not already showing stats
            if (!args.includes('--stat') && !args.includes('--numstat') && !args.includes('--shortstat') && !args.includes('--name-only') && !args.includes('--name-status')) {
                try {
                    const statResult = execSync(diffCmd.replace(/--color-words|--word-diff/g, '') + ' --shortstat', { encoding: 'utf-8' });
                    if (statResult.trim()) {
                        console.log(chalk.gray('━'.repeat(40)));
                        console.log(chalk.cyan('📊 Summary: ') + chalk.white(statResult.trim()));
                    }
                } catch (e) {
                    // Ignore stat errors
                }
            }
        }
        
        // Show next steps
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Next Steps:'));
        if (!args.includes('--staged') && !args.includes('--cached')) {
            console.log(chalk.white('  gadd <files>') + '             # Stage specific changes');
            console.log(chalk.white('  gdiff --staged') + '           # View staged changes');
            console.log(chalk.white('  gcommit -a "message"') + '     # Stage all and commit');
        } else {
            console.log(chalk.white('  gcommit "message"') + '        # Commit staged changes');
            console.log(chalk.white('  gdiff') + '                   # View unstaged changes');
        }
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        
        // Common error suggestions
        if (error.message.includes('bad revision')) {
            console.log(chalk.yellow('💡 Check branch/commit name spelling'));
        } else if (error.message.includes('ambiguous')) {
            console.log(chalk.yellow('💡 Use full branch name or commit hash'));
        }
        
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
