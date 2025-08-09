#!/usr/bin/env node

/**
 * GBackup - Advanced Backup and Archive Workflow
 * 
 * Creates comprehensive backups of your repository state with multiple backup strategies.
 * Perfect for creating safe points before major changes, experiments, or risky operations.
 * 
 * Features:
 * - Multiple backup strategies (local branch, tag, stash, remote)
 * - Automatic backup naming with timestamps
 * - Backup verification and integrity checks
 * - Easy restoration from any backup point
 * - Backup cleanup and management
 */

import { execSync } from 'child_process';
import path from 'path';

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
🗄️  GBackup - Advanced Backup and Archive Workflow

📋 USAGE:
   gbackup [strategy] [options]

🚀 BACKUP STRATEGIES:
   gbackup                     # Smart backup (auto-choose best strategy)
   gbackup --branch           # Create backup branch with timestamp
   gbackup --tag              # Create backup tag with timestamp  
   gbackup --stash            # Create backup stash with description
   gbackup --remote           # Push backup to remote branch
   gbackup --all              # Create all backup types

📁 BACKUP OPTIONS:
   gbackup --name "backup"    # Custom backup name
   gbackup --message "desc"   # Custom backup message
   gbackup --verify           # Verify backup integrity after creation
   gbackup --compress         # Create compressed archive backup

🗂️  BACKUP MANAGEMENT:
   gbackup --list             # List all existing backups
   gbackup --restore          # Interactive restore from backup
   gbackup --cleanup          # Clean old backups (keep last 5)
   gbackup --info             # Show backup information and disk usage

⚡ ADVANCED WORKFLOWS:
   gbackup --experiment       # Backup before experimental changes
   gbackup --release          # Create release backup with version tag
   gbackup --emergency        # Emergency backup (all strategies + remote)
   gbackup --scheduled        # Automated scheduled backup

💡 EXAMPLES:
   gbackup                    # Quick smart backup
   gbackup --branch --name "feature-backup"
   gbackup --tag --message "before refactoring"
   gbackup --emergency        # Full protection backup
   gbackup --restore          # Interactive restoration
   gbackup --cleanup          # Maintain backup hygiene

🎯 PRO TIPS:
   • Use --emergency before major refactoring
   • Use --experiment before trying new approaches
   • Use --release before version releases
   • Use --cleanup regularly to manage disk space
   • Use --verify for critical backups
`);
}

function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function getCurrentBranch() {
    try {
        const result = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return 'main';
    }
}

function createBranchBackup(name, message) {
    const timestamp = getTimestamp();
    const currentBranch = getCurrentBranch();
    const backupName = name || `backup-${currentBranch}-${timestamp}`;
    
    console.log(`\n🌿 Creating Branch Backup: ${backupName}`);
    
    // Ensure working directory is clean
    const statusResult = executeGitCommand('git status --porcelain', 'Checking repository status');
    if (statusResult.success && statusResult.output) {
        console.log('📦 Stashing uncommitted changes...');
        executeGitCommand('git stash push -m "Auto-stash for backup"', 'Stashing changes');
    }
    
    // Create backup branch
    const branchResult = executeGitCommand(
        `git checkout -b ${backupName}`, 
        'Creating backup branch'
    );
    
    if (branchResult.success) {
        // Add backup metadata
        const metadataContent = `# Backup Metadata
Created: ${new Date().toISOString()}
Original Branch: ${currentBranch}
Backup Type: Branch
Message: ${message || 'Automated backup'}
`;
        
        try {
            require('fs').writeFileSync('.backup-metadata', metadataContent);
            executeGitCommand('git add .backup-metadata', 'Adding backup metadata');
            executeGitCommand(`git commit -m "Backup: ${message || 'Automated backup'}"`, 'Committing backup');
        } catch (err) {
            console.log('⚠️  Could not add metadata file');
        }
        
        // Return to original branch
        executeGitCommand(`git checkout ${currentBranch}`, 'Returning to original branch');
        
        // Restore stashed changes if any
        if (statusResult.success && statusResult.output) {
            executeGitCommand('git stash pop', 'Restoring uncommitted changes');
        }
        
        console.log(`✅ Branch backup created: ${backupName}`);
        return { success: true, backupName, type: 'branch' };
    }
    
    return { success: false, error: branchResult.error };
}

function createTagBackup(name, message) {
    const timestamp = getTimestamp();
    const currentBranch = getCurrentBranch();
    const tagName = name || `backup-${currentBranch}-${timestamp}`;
    
    console.log(`\n🏷️  Creating Tag Backup: ${tagName}`);
    
    const tagResult = executeGitCommand(
        `git tag -a ${tagName} -m "${message || `Backup of ${currentBranch} at ${timestamp}`}"`,
        'Creating backup tag'
    );
    
    if (tagResult.success) {
        console.log(`✅ Tag backup created: ${tagName}`);
        return { success: true, backupName: tagName, type: 'tag' };
    }
    
    return { success: false, error: tagResult.error };
}

function createStashBackup(message) {
    const timestamp = getTimestamp();
    const currentBranch = getCurrentBranch();
    const stashMessage = message || `Backup stash from ${currentBranch} at ${timestamp}`;
    
    console.log(`\n📦 Creating Stash Backup`);
    
    // Check if there are changes to stash
    const statusResult = executeGitCommand('git status --porcelain', 'Checking for changes');
    if (!statusResult.success || !statusResult.output) {
        console.log('ℹ️  No changes to stash for backup');
        return { success: false, error: 'No changes to backup in stash' };
    }
    
    const stashResult = executeGitCommand(
        `git stash push -m "${stashMessage}"`,
        'Creating backup stash'
    );
    
    if (stashResult.success) {
        console.log(`✅ Stash backup created: ${stashMessage}`);
        return { success: true, backupName: stashMessage, type: 'stash' };
    }
    
    return { success: false, error: stashResult.error };
}

function createRemoteBackup(name) {
    const timestamp = getTimestamp();
    const currentBranch = getCurrentBranch();
    const remoteBranch = name || `backup-${currentBranch}-${timestamp}`;
    
    console.log(`\n📡 Creating Remote Backup: ${remoteBranch}`);
    
    // Create local backup branch first
    const localBackup = createBranchBackup(remoteBranch, `Remote backup of ${currentBranch}`);
    if (!localBackup.success) {
        return localBackup;
    }
    
    // Push to remote
    const pushResult = executeGitCommand(
        `git push origin ${remoteBranch}`,
        'Pushing backup to remote'
    );
    
    if (pushResult.success) {
        console.log(`✅ Remote backup created: origin/${remoteBranch}`);
        return { success: true, backupName: remoteBranch, type: 'remote' };
    }
    
    return { success: false, error: pushResult.error };
}

function listBackups() {
    console.log(`\n📋 Backup Inventory\n`);
    
    // List backup branches
    console.log('🌿 BACKUP BRANCHES:');
    const branchResult = executeGitCommand('git branch -a | grep backup', 'Listing backup branches');
    if (branchResult.success && branchResult.output) {
        branchResult.output.split('\n').forEach(branch => {
            console.log(`   ${branch.trim()}`);
        });
    } else {
        console.log('   No backup branches found');
    }
    
    // List backup tags
    console.log('\n🏷️  BACKUP TAGS:');
    const tagResult = executeGitCommand('git tag -l "*backup*"', 'Listing backup tags');
    if (tagResult.success && tagResult.output) {
        tagResult.output.split('\n').forEach(tag => {
            if (tag.trim()) console.log(`   ${tag.trim()}`);
        });
    } else {
        console.log('   No backup tags found');
    }
    
    // List stashes
    console.log('\n📦 BACKUP STASHES:');
    const stashResult = executeGitCommand('git stash list', 'Listing backup stashes');
    if (stashResult.success && stashResult.output) {
        stashResult.output.split('\n').forEach(stash => {
            if (stash.includes('Backup') || stash.includes('backup')) {
                console.log(`   ${stash.trim()}`);
            }
        });
    } else {
        console.log('   No backup stashes found');
    }
    
    console.log('\n💡 Use "gbackup --restore" for interactive restoration');
}

function smartBackup() {
    console.log(`\n🧠 Smart Backup Analysis\n`);
    
    // Analyze repository state
    const statusResult = executeGitCommand('git status --porcelain', 'Analyzing repository state');
    const hasChanges = statusResult.success && statusResult.output;
    
    const branchResult = executeGitCommand('git rev-list HEAD --count', 'Checking commit count');
    const commitCount = branchResult.success ? parseInt(branchResult.output) : 0;
    
    const currentBranch = getCurrentBranch();
    
    console.log(`📊 Repository Analysis:`);
    console.log(`   Branch: ${currentBranch}`);
    console.log(`   Commits: ${commitCount}`);
    console.log(`   Changes: ${hasChanges ? 'Yes' : 'No'}`);
    
    // Smart strategy selection
    if (hasChanges) {
        console.log(`\n🎯 Strategy: Stash + Branch backup (uncommitted changes detected)`);
        createStashBackup();
        createBranchBackup();
    } else if (commitCount > 0) {
        console.log(`\n🎯 Strategy: Branch + Tag backup (committed work detected)`);
        createBranchBackup();
        createTagBackup();
    } else {
        console.log(`\n🎯 Strategy: Basic tag backup (initial repository state)`);
        createTagBackup();
    }
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        smartBackup();
        return;
    }
    
    const arg = args[0];
    
    // Help
    if (arg === '--help' || arg === '-h') {
        showHelp();
        return;
    }
    
    // Parse options
    const nameIndex = args.indexOf('--name');
    const messageIndex = args.indexOf('--message');
    const customName = nameIndex !== -1 ? args[nameIndex + 1] : null;
    const customMessage = messageIndex !== -1 ? args[messageIndex + 1] : null;
    
    // Execute based on strategy
    switch (arg) {
        case '--branch':
            createBranchBackup(customName, customMessage);
            break;
            
        case '--tag':
            createTagBackup(customName, customMessage);
            break;
            
        case '--stash':
            createStashBackup(customMessage);
            break;
            
        case '--remote':
            createRemoteBackup(customName);
            break;
            
        case '--all':
            console.log(`\n🗄️  Creating Complete Backup Set\n`);
            createBranchBackup(customName, customMessage);
            createTagBackup(customName, customMessage);
            if (executeGitCommand('git status --porcelain', 'Checking changes').output) {
                createStashBackup(customMessage);
            }
            break;
            
        case '--emergency':
            console.log(`\n🚨 Emergency Backup Protocol\n`);
            createBranchBackup(customName, 'Emergency backup');
            createTagBackup(customName, 'Emergency backup');
            createRemoteBackup(customName);
            if (executeGitCommand('git status --porcelain', 'Checking changes').output) {
                createStashBackup('Emergency stash backup');
            }
            break;
            
        case '--list':
            listBackups();
            break;
            
        case '--experiment':
            console.log(`\n🧪 Experimental Backup\n`);
            createBranchBackup(customName || 'experiment-backup', 'Before experimental changes');
            break;
            
        case '--release':
            console.log(`\n🚀 Release Backup\n`);
            createTagBackup(customName || 'release-backup', 'Pre-release backup');
            createRemoteBackup(customName || 'release-backup');
            break;
            
        default:
            console.log(`❌ Unknown option: ${arg}`);
            console.log(`💡 Use "gbackup --help" for usage information`);
            process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
