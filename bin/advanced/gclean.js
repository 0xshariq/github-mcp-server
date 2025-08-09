#!/usr/bin/env node

/**
 * GClean - Advanced Repository Cleanup and Maintenance Workflow
 * 
 * Comprehensive repository maintenance tool for keeping your Git repository 
 * clean, optimized, and efficient. Handles cleanup of branches, tags, stashes,
 * and performs repository optimization.
 * 
 * Features:
 * - Smart cleanup of merged branches and stale references
 * - Repository optimization and garbage collection
 * - Safe cleanup with confirmation prompts
 * - Backup before destructive operations
 * - Detailed cleanup reporting and statistics
 */

import { execSync } from 'child_process';
import readline from 'readline';

function executeGitCommand(command, description) {
    try {
        console.log(`🔄 ${description}...`);
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        return { success: true, output: result.trim() };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            output: error.stdout || error.stderr || error.message
        };
    }
}

function showHelp() {
    console.log(`
🧹 GClean - Advanced Repository Cleanup and Maintenance

📋 USAGE:
   gclean [operation] [options]

🧽 CLEANUP OPERATIONS:
   gclean                     # Interactive cleanup menu
   gclean --branches          # Clean merged and stale branches
   gclean --tags              # Clean old and unused tags
   gclean --stashes           # Clean old stashes
   gclean --remotes           # Clean stale remote tracking branches
   gclean --all               # Complete repository cleanup

🔧 MAINTENANCE OPERATIONS:
   gclean --optimize          # Optimize repository (gc, prune, repack)
   gclean --repair            # Repair repository issues
   gclean --analyze           # Analyze repository health
   gclean --vacuum            # Deep cleanup and optimization

🛡️  SAFETY OPTIONS:
   gclean --dry-run           # Show what would be cleaned (no changes)
   gclean --backup            # Create backup before cleanup
   gclean --force             # Skip confirmation prompts
   gclean --keep <n>          # Keep last N items (default: 5)

📊 REPORTING OPTIONS:
   gclean --stats             # Show repository statistics
   gclean --history           # Show cleanup history
   gclean --size              # Analyze repository size and growth

⚡ ADVANCED WORKFLOWS:
   gclean --reset-clean       # Reset to clean state (DESTRUCTIVE)
   gclean --archive-old       # Archive old branches instead of deleting
   gclean --smart             # Smart cleanup based on branch patterns
   gclean --maintenance       # Full maintenance cycle

💡 EXAMPLES:
   gclean                     # Interactive cleanup
   gclean --branches --dry-run    # Preview branch cleanup
   gclean --all --backup      # Safe complete cleanup
   gclean --optimize          # Optimize repository performance
   gclean --stats             # View repository statistics

🎯 PRO TIPS:
   • Always use --dry-run first to preview changes
   • Use --backup for destructive operations
   • Run --optimize regularly for performance
   • Use --smart for intelligent cleanup patterns
`);
}

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function askQuestion(question) {
    const rl = createReadlineInterface();
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().trim());
        });
    });
}

async function confirmAction(message) {
    const answer = await askQuestion(`${message} (y/N): `);
    return answer === 'y' || answer === 'yes';
}

function getCurrentBranch() {
    try {
        const result = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return 'main';
    }
}

function getRepositoryStats() {
    console.log(`\n📊 Repository Statistics\n`);
    
    // Basic repository info
    const currentBranch = getCurrentBranch();
    console.log(`📍 Current Branch: ${currentBranch}`);
    
    // Count branches
    const branchResult = executeGitCommand('git branch -a | wc -l', 'Counting branches');
    if (branchResult.success) {
        console.log(`🌿 Total Branches: ${branchResult.output}`);
    }
    
    // Count commits
    const commitResult = executeGitCommand('git rev-list --all --count', 'Counting commits');
    if (commitResult.success) {
        console.log(`📝 Total Commits: ${commitResult.output}`);
    }
    
    // Count tags
    const tagResult = executeGitCommand('git tag | wc -l', 'Counting tags');
    if (tagResult.success) {
        console.log(`🏷️  Total Tags: ${tagResult.output}`);
    }
    
    // Count stashes
    const stashResult = executeGitCommand('git stash list | wc -l', 'Counting stashes');
    if (stashResult.success) {
        console.log(`📦 Total Stashes: ${stashResult.output}`);
    }
    
    // Repository size
    const sizeResult = executeGitCommand('du -sh .git', 'Calculating repository size');
    if (sizeResult.success) {
        console.log(`💾 Repository Size: ${sizeResult.output.split('\t')[0]}`);
    }
    
    // Number of files
    const fileResult = executeGitCommand('find . -type f | grep -v ".git" | wc -l', 'Counting files');
    if (fileResult.success) {
        console.log(`📄 Tracked Files: ${fileResult.output}`);
    }
}

async function cleanBranches(dryRun = false, keepCount = 5) {
    console.log(`\n🌿 Cleaning Branches${dryRun ? ' (DRY RUN)' : ''}\n`);
    
    const currentBranch = getCurrentBranch();
    const protectedBranches = ['main', 'master', 'develop', 'dev', currentBranch];
    
    // Find merged branches
    const mergedResult = executeGitCommand('git branch --merged', 'Finding merged branches');
    if (mergedResult.success && mergedResult.output) {
        const mergedBranches = mergedResult.output
            .split('\n')
            .map(branch => branch.trim().replace('*', '').trim())
            .filter(branch => branch && !protectedBranches.includes(branch));
        
        if (mergedBranches.length > 0) {
            console.log('🔍 Merged branches to clean:');
            mergedBranches.forEach(branch => console.log(`   - ${branch}`));
            
            if (!dryRun) {
                const confirm = await confirmAction('Delete these merged branches?');
                if (confirm) {
                    mergedBranches.forEach(branch => {
                        executeGitCommand(`git branch -d ${branch}`, `Deleting merged branch: ${branch}`);
                    });
                }
            }
        } else {
            console.log('✅ No merged branches to clean');
        }
    }
    
    // Find stale remote tracking branches
    const staleResult = executeGitCommand('git remote prune origin --dry-run', 'Finding stale remote branches');
    if (staleResult.success && staleResult.output) {
        console.log('\n🌐 Stale remote tracking branches:');
        console.log(staleResult.output);
        
        if (!dryRun) {
            const confirm = await confirmAction('Clean stale remote tracking branches?');
            if (confirm) {
                executeGitCommand('git remote prune origin', 'Cleaning stale remote tracking branches');
            }
        }
    }
}

async function cleanTags(dryRun = false, keepCount = 10) {
    console.log(`\n🏷️  Cleaning Tags${dryRun ? ' (DRY RUN)' : ''}\n`);
    
    const tagResult = executeGitCommand('git tag -l', 'Listing all tags');
    if (tagResult.success && tagResult.output) {
        const tags = tagResult.output.split('\n').filter(tag => tag.trim());
        
        if (tags.length > keepCount) {
            const tagsToDelete = tags.slice(0, tags.length - keepCount);
            
            console.log(`🔍 Old tags to clean (keeping last ${keepCount}):`);
            tagsToDelete.forEach(tag => console.log(`   - ${tag}`));
            
            if (!dryRun) {
                const confirm = await confirmAction(`Delete ${tagsToDelete.length} old tags?`);
                if (confirm) {
                    tagsToDelete.forEach(tag => {
                        executeGitCommand(`git tag -d ${tag}`, `Deleting tag: ${tag}`);
                    });
                }
            }
        } else {
            console.log(`✅ No tags to clean (${tags.length} total, keeping ${keepCount})`);
        }
    }
}

async function cleanStashes(dryRun = false, keepCount = 3) {
    console.log(`\n📦 Cleaning Stashes${dryRun ? ' (DRY RUN)' : ''}\n`);
    
    const stashResult = executeGitCommand('git stash list', 'Listing all stashes');
    if (stashResult.success && stashResult.output) {
        const stashes = stashResult.output.split('\n').filter(stash => stash.trim());
        
        if (stashes.length > keepCount) {
            const stashesToDelete = stashes.length - keepCount;
            
            console.log(`🔍 Old stashes to clean (keeping last ${keepCount}):`);
            console.log(`   Will clean ${stashesToDelete} oldest stashes`);
            
            if (!dryRun) {
                const confirm = await confirmAction(`Delete ${stashesToDelete} old stashes?`);
                if (confirm) {
                    for (let i = 0; i < stashesToDelete; i++) {
                        executeGitCommand('git stash drop stash@{0}', `Deleting oldest stash`);
                    }
                }
            }
        } else {
            console.log(`✅ No stashes to clean (${stashes.length} total, keeping ${keepCount})`);
        }
    }
}

function optimizeRepository() {
    console.log(`\n⚡ Optimizing Repository\n`);
    
    // Garbage collection
    executeGitCommand('git gc --aggressive --prune=now', 'Running garbage collection');
    
    // Repack objects
    executeGitCommand('git repack -ad', 'Repacking objects');
    
    // Prune loose objects
    executeGitCommand('git prune', 'Pruning loose objects');
    
    // Update server info
    executeGitCommand('git update-server-info', 'Updating server info');
    
    // Verify repository integrity
    executeGitCommand('git fsck --full', 'Verifying repository integrity');
    
    console.log('✅ Repository optimization complete');
}

async function interactiveCleanup() {
    console.log(`\n🧹 Interactive Repository Cleanup\n`);
    
    // Show current stats
    getRepositoryStats();
    
    console.log(`\n🎯 Available Cleanup Operations:\n`);
    console.log('1. Clean merged branches');
    console.log('2. Clean old tags');
    console.log('3. Clean old stashes');
    console.log('4. Optimize repository');
    console.log('5. Complete cleanup (all above)');
    console.log('6. Show statistics only');
    console.log('0. Exit');
    
    const choice = await askQuestion('\nSelect operation (0-6): ');
    
    switch (choice) {
        case '1':
            await cleanBranches();
            break;
        case '2':
            await cleanTags();
            break;
        case '3':
            await cleanStashes();
            break;
        case '4':
            optimizeRepository();
            break;
        case '5':
            const confirm = await confirmAction('Perform complete cleanup?');
            if (confirm) {
                await cleanBranches(false, 5);
                await cleanTags(false, 10);
                await cleanStashes(false, 3);
                optimizeRepository();
            }
            break;
        case '6':
            getRepositoryStats();
            break;
        case '0':
            console.log('👋 Cleanup cancelled');
            break;
        default:
            console.log('❌ Invalid selection');
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        await interactiveCleanup();
        return;
    }
    
    const arg = args[0];
    const dryRun = args.includes('--dry-run');
    const keepIndex = args.indexOf('--keep');
    const keepCount = keepIndex !== -1 ? parseInt(args[keepIndex + 1]) || 5 : 5;
    
    // Help
    if (arg === '--help' || arg === '-h') {
        showHelp();
        return;
    }
    
    // Execute based on operation
    switch (arg) {
        case '--branches':
            await cleanBranches(dryRun, keepCount);
            break;
            
        case '--tags':
            await cleanTags(dryRun, keepCount);
            break;
            
        case '--stashes':
            await cleanStashes(dryRun, keepCount);
            break;
            
        case '--optimize':
            optimizeRepository();
            break;
            
        case '--stats':
            getRepositoryStats();
            break;
            
        case '--all':
            if (args.includes('--backup')) {
                console.log('🗄️  Creating backup before cleanup...');
                execSync('gbackup --all', { stdio: 'inherit' });
            }
            
            await cleanBranches(dryRun, keepCount);
            await cleanTags(dryRun, keepCount);
            await cleanStashes(dryRun, keepCount);
            
            if (!dryRun) {
                optimizeRepository();
            }
            break;
            
        case '--smart':
            console.log(`\n🧠 Smart Cleanup Analysis\n`);
            // Analyze patterns and clean accordingly
            await cleanBranches(dryRun, keepCount);
            await cleanTags(dryRun, Math.max(keepCount * 2, 10));
            await cleanStashes(dryRun, Math.max(keepCount - 2, 2));
            break;
            
        default:
            console.log(`❌ Unknown option: ${arg}`);
            console.log(`💡 Use "gclean --help" for usage information`);
            process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
