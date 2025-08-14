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
    console.log(chalk.magenta.bold('\n📊 gstatus - Repository Status\n'));
    console.log(chalk.cyan('Purpose:'), 'Show comprehensive repository status including staged/unstaged changes, branch info, and working directory state.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gstatus [options]\n'));
    
    console.log(chalk.cyan('Essential Options:'));
    console.log('  ' + chalk.green('-s, --short') + '           - Show short format status');
    console.log('  ' + chalk.green('-b, --branch') + '          - Show branch information');
    console.log('  ' + chalk.green('--porcelain') + '           - Machine-readable format');
    console.log('  ' + chalk.green('--ignored') + '             - Show ignored files too');
    console.log('  ' + chalk.green('--untracked-files <mode>') + ' - Control untracked files display');
    console.log('  ' + chalk.green('--column') + '              - Display in columns');
    console.log('  ' + chalk.green('-z') + '                    - Terminate entries with NUL character');
    console.log('  ' + chalk.green('-h, --help') + '            - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gstatus') + '                    # Show detailed status');
    console.log(chalk.white('  gstatus -s') + '                 # Short format');
    console.log(chalk.white('  gstatus -b') + '                 # With branch info');
    console.log(chalk.white('  gstatus --ignored') + '          # Include ignored files\n');
    
    console.log(chalk.cyan('💡 Workflow Tips:'));
    console.log('  • Use ' + chalk.yellow('gstatus -s') + ' for quick overview');
    console.log('  • Use ' + chalk.yellow('gstatus -b') + ' to see branch tracking info');
    console.log('  • Check status before commits with ' + chalk.yellow('gadd') + ' and ' + chalk.yellow('gcommit'));
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('📊 Repository Status'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git status command with options
    let statusCmd = 'git status';
    let useShortFormat = false;
    
    if (args.includes('-s') || args.includes('--short')) {
        statusCmd += ' --short';
        useShortFormat = true;
    }
    if (args.includes('-b') || args.includes('--branch')) {
        statusCmd += ' --branch';
    }
    if (args.includes('--porcelain')) {
        statusCmd += ' --porcelain';
        useShortFormat = true;
    }
    if (args.includes('--ignored')) {
        statusCmd += ' --ignored';
    }
    if (args.includes('--column')) {
        statusCmd += ' --column';
    }
    if (args.includes('-z')) {
        statusCmd += ' -z';
    }
    
    // Handle untracked-files option
    const untrackedIndex = args.findIndex(arg => arg === '--untracked-files');
    if (untrackedIndex !== -1 && args[untrackedIndex + 1]) {
        statusCmd += ` --untracked-files=${args[untrackedIndex + 1]}`;
    }
    
    console.log(chalk.cyan(`🔍 Running: ${statusCmd}`));
    
    try {
        const result = execSync(statusCmd, { encoding: 'utf-8' });
        
        if (result.trim()) {
            if (!useShortFormat) {
                console.log(chalk.gray('━'.repeat(40)));
            }
            console.log(result);
        } else {
            console.log(chalk.green('✅ Working directory clean - no changes detected'));
        }
        
        // Additional repository info for detailed view
        if (!useShortFormat && !args.includes('--porcelain')) {
            console.log(chalk.gray('━'.repeat(40)));
            console.log(chalk.cyan('📈 Repository Summary:'));
            
            // Get current branch
            try {
                const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
                console.log(chalk.white(`  Branch: ${chalk.yellow(branch)}`));
            } catch (e) {
                console.log(chalk.white('  Branch: ' + chalk.gray('(detached HEAD)')));
            }
            
            // Get commit count
            try {
                const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
                console.log(chalk.white(`  Commits: ${chalk.yellow(commitCount)}`));
            } catch (e) {
                console.log(chalk.white('  Commits: ' + chalk.gray('(no commits yet)')));
            }
            
            // Get remotes
            try {
                const remotes = execSync('git remote -v', { encoding: 'utf-8' }).trim();
                if (remotes) {
                    console.log(chalk.white('  Remotes: ' + chalk.yellow('configured')));
                } else {
                    console.log(chalk.white('  Remotes: ' + chalk.gray('none')));
                }
            } catch (e) {
                console.log(chalk.white('  Remotes: ' + chalk.gray('none')));
            }
        }
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
};
