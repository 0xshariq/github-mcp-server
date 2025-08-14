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
    console.log(chalk.magenta.bold('\n🌐 gremote - Remote Management\n'));
    console.log(chalk.cyan('Purpose:'), 'Manage remote repositories with comprehensive operations for adding, removing, and configuring remotes.\n');
    
    console.log(chalk.cyan('Command:'), chalk.white('gremote [subcommand] [options]\n'));
    
    console.log(chalk.cyan('Subcommands:'));
    console.log('  ' + chalk.green('add <name> <url>') + '        - Add a new remote');
    console.log('  ' + chalk.green('remove <name>') + '           - Remove a remote');
    console.log('  ' + chalk.green('rm <name>') + '               - Same as remove');
    console.log('  ' + chalk.green('rename <old> <new>') + '      - Rename a remote');
    console.log('  ' + chalk.green('set-url <name> <url>') + '    - Change remote URL');
    console.log('  ' + chalk.green('get-url <name>') + '          - Get remote URL');
    console.log('  ' + chalk.green('show <name>') + '             - Show remote details');
    console.log('  ' + chalk.green('prune <name>') + '            - Prune remote tracking branches\n');
    
    console.log(chalk.cyan('List Options:'));
    console.log('  ' + chalk.green('-v, --verbose') + '           - Show URLs along with names');
    console.log('  ' + chalk.green('--push') + '                  - Show push URLs (with set-url)');
    console.log('  ' + chalk.green('--add') + '                   - Add URL instead of replace (with set-url)');
    console.log('  ' + chalk.green('--delete') + '                - Delete URL (with set-url)');
    console.log('  ' + chalk.green('-h, --help') + '              - Show detailed help information\n');
    
    console.log(chalk.cyan('Common Use Cases:'));
    console.log(chalk.white('  gremote') + '                      # List all remotes');
    console.log(chalk.white('  gremote -v') + '                   # List with URLs');
    console.log(chalk.white('  gremote add origin <url>') + '     # Add origin remote');
    console.log(chalk.white('  gremote add upstream <url>') + '   # Add upstream for forks');
    console.log(chalk.white('  gremote set-url origin <url>') + ' # Change origin URL');
    console.log(chalk.white('  gremote remove upstream') + '      # Remove upstream');
    console.log(chalk.white('  gremote show origin') + '          # Show origin details');
    console.log(chalk.white('  gremote prune origin') + '         # Clean up remote branches\n');
    
    console.log(chalk.cyan('🔗 URL Formats:'));
    console.log('  • HTTPS: https://github.com/user/repo.git');
    console.log('  • SSH: git@github.com:user/repo.git');
    console.log('  • Git: git://github.com/user/repo.git');
    console.log('\n' + chalk.gray('═'.repeat(60)));
}

function isValidRemoteName(name) {
    // Basic validation for remote names
    return /^[a-zA-Z0-9._-]+$/.test(name) && name.length > 0;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }
    
    validateRepository();
    
    console.log(chalk.magenta.bold('🌐 Remote Repository Management'));
    console.log(chalk.gray('━'.repeat(40)));
    
    // Build git remote command
    let remoteCmd = 'git remote';
    let action = 'list';
    let remoteName = '';
    let remoteUrl = '';
    
    if (args.length === 0) {
        action = 'list';
    } else {
        const subcommand = args[0];
        
        if (subcommand === 'add') {
            action = 'add';
            remoteName = args[1];
            remoteUrl = args[2];
            remoteCmd = `git remote add`;
            
            if (!remoteName || !remoteUrl) {
                console.error(chalk.red('❌ Error: Both remote name and URL are required'));
                console.log(chalk.yellow('💡 Usage: gremote add <name> <url>'));
                process.exit(1);
            }
            
            if (!isValidRemoteName(remoteName)) {
                console.error(chalk.red('❌ Error: Invalid remote name'));
                console.log(chalk.yellow('💡 Remote names should contain only letters, numbers, dots, hyphens, and underscores'));
                process.exit(1);
            }
            
            remoteCmd += ` ${remoteName} "${remoteUrl}"`;
            
        } else if (subcommand === 'remove' || subcommand === 'rm') {
            action = 'remove';
            remoteName = args[1];
            remoteCmd = `git remote remove`;
            
            if (!remoteName) {
                console.error(chalk.red('❌ Error: Remote name is required'));
                console.log(chalk.yellow('💡 Usage: gremote remove <name>'));
                process.exit(1);
            }
            
            remoteCmd += ` ${remoteName}`;
            
        } else if (subcommand === 'rename') {
            action = 'rename';
            const oldName = args[1];
            const newName = args[2];
            remoteCmd = `git remote rename`;
            
            if (!oldName || !newName) {
                console.error(chalk.red('❌ Error: Both old and new names are required'));
                console.log(chalk.yellow('💡 Usage: gremote rename <old-name> <new-name>'));
                process.exit(1);
            }
            
            if (!isValidRemoteName(newName)) {
                console.error(chalk.red('❌ Error: Invalid new remote name'));
                process.exit(1);
            }
            
            remoteCmd += ` ${oldName} ${newName}`;
            
        } else if (subcommand === 'set-url') {
            action = 'set-url';
            remoteName = args[1];
            remoteUrl = args[2];
            remoteCmd = `git remote set-url`;
            
            // Handle options
            if (args.includes('--push')) {
                remoteCmd += ' --push';
            }
            if (args.includes('--add')) {
                remoteCmd += ' --add';
            }
            if (args.includes('--delete')) {
                remoteCmd += ' --delete';
            }
            
            if (!remoteName || (!remoteUrl && !args.includes('--delete'))) {
                console.error(chalk.red('❌ Error: Remote name and URL are required'));
                console.log(chalk.yellow('💡 Usage: gremote set-url <name> <url>'));
                process.exit(1);
            }
            
            remoteCmd += ` ${remoteName}`;
            if (remoteUrl) {
                remoteCmd += ` "${remoteUrl}"`;
            }
            
        } else if (subcommand === 'get-url') {
            action = 'get-url';
            remoteName = args[1];
            remoteCmd = `git remote get-url`;
            
            if (!remoteName) {
                console.error(chalk.red('❌ Error: Remote name is required'));
                console.log(chalk.yellow('💡 Usage: gremote get-url <name>'));
                process.exit(1);
            }
            
            if (args.includes('--push')) {
                remoteCmd += ' --push';
            }
            if (args.includes('--all')) {
                remoteCmd += ' --all';
            }
            
            remoteCmd += ` ${remoteName}`;
            
        } else if (subcommand === 'show') {
            action = 'show';
            remoteName = args[1];
            remoteCmd = `git remote show`;
            
            if (!remoteName) {
                console.error(chalk.red('❌ Error: Remote name is required'));
                console.log(chalk.yellow('💡 Usage: gremote show <name>'));
                process.exit(1);
            }
            
            remoteCmd += ` ${remoteName}`;
            
        } else if (subcommand === 'prune') {
            action = 'prune';
            remoteName = args[1];
            remoteCmd = `git remote prune`;
            
            if (!remoteName) {
                console.error(chalk.red('❌ Error: Remote name is required'));
                console.log(chalk.yellow('💡 Usage: gremote prune <name>'));
                process.exit(1);
            }
            
            if (args.includes('--dry-run')) {
                remoteCmd += ' --dry-run';
            }
            
            remoteCmd += ` ${remoteName}`;
            
        } else if (subcommand === '-v' || subcommand === '--verbose') {
            action = 'list';
            remoteCmd = 'git remote -v';
        } else {
            // Treat as listing with options
            action = 'list';
            if (args.includes('-v') || args.includes('--verbose')) {
                remoteCmd = 'git remote -v';
            }
        }
    }
    
    console.log(chalk.cyan(`🔍 Running: ${remoteCmd}`));
    
    try {
        const result = execSync(remoteCmd, { encoding: 'utf-8' });
        
        if (action === 'list') {
            if (result.trim()) {
                console.log(chalk.cyan('🌐 Configured Remotes:'));
                const remotes = result.trim().split('\n');
                
                if (remoteCmd.includes('-v')) {
                    // Verbose listing with URLs
                    const remoteMap = new Map();
                    remotes.forEach(line => {
                        const [name, url, type] = line.split(/\s+/);
                        if (!remoteMap.has(name)) {
                            remoteMap.set(name, { fetch: '', push: '' });
                        }
                        if (type === '(fetch)') {
                            remoteMap.get(name).fetch = url;
                        } else if (type === '(push)') {
                            remoteMap.get(name).push = url;
                        }
                    });
                    
                    for (const [name, urls] of remoteMap) {
                        console.log(`  ${chalk.green('📡')} ${chalk.white.bold(name)}`);
                        console.log(`    ${chalk.gray('Fetch:')} ${chalk.white(urls.fetch)}`);
                        if (urls.push !== urls.fetch) {
                            console.log(`    ${chalk.gray('Push:')} ${chalk.white(urls.push)}`);
                        }
                    }
                } else {
                    // Simple listing
                    remotes.forEach(remote => {
                        console.log(`  ${chalk.green('📡')} ${chalk.white(remote)}`);
                    });
                }
            } else {
                console.log(chalk.yellow('ℹ️  No remotes configured'));
                console.log(chalk.gray('💡 Add a remote with: gremote add origin <url>'));
            }
        } else {
            // Other actions
            if (result.trim()) {
                console.log(result);
            }
            
            const actionMessages = {
                'add': `✅ Remote '${remoteName}' added successfully`,
                'remove': `✅ Remote '${remoteName}' removed successfully`,
                'rename': `✅ Remote renamed successfully`,
                'set-url': `✅ Remote URL updated successfully`,
                'get-url': `📋 Remote URL for '${remoteName}':`,
                'show': `📊 Remote details for '${remoteName}':`,
                'prune': `✅ Remote branches pruned successfully`
            };
            
            if (actionMessages[action]) {
                console.log(chalk.green(actionMessages[action]));
            }
        }
        
        // Show next steps based on action
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.cyan('💡 Remote Operations:'));
        
        if (action === 'add') {
            console.log(chalk.white('  gpush -u ' + remoteName + ' main') + '    # Push and set upstream');
            console.log(chalk.white('  gpull') + '                       # Pull from remote');
        } else if (action === 'list') {
            console.log(chalk.white('  gremote add <name> <url>') + '    # Add new remote');
            console.log(chalk.white('  gremote show <name>') + '         # Show remote details');
        }
        
        console.log(chalk.white('  gremote -v') + '                  # List remotes with URLs');
        console.log(chalk.white('  gstatus') + '                     # Check current status');
        
        console.log(chalk.green('\n✅ Command completed successfully'));
        
    } catch (error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
        
        // Common error suggestions
        if (error.message.includes('already exists')) {
            console.log(chalk.yellow(`💡 Remote '${remoteName}' already exists. Use set-url to change it.`));
        } else if (error.message.includes('No such remote')) {
            console.log(chalk.yellow(`💡 Remote '${remoteName}' not found. Use 'gremote' to list existing remotes.`));
        } else if (error.message.includes('Invalid URL')) {
            console.log(chalk.yellow('💡 Check URL format. Examples:'));
            console.log(chalk.yellow('  • https://github.com/user/repo.git'));
            console.log(chalk.yellow('  • git@github.com:user/repo.git'));
        }
        
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}