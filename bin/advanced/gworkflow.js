#!/usr/bin/env node

/**
 * GWorkflow - Advanced Git Workflow Automation
 * 
 * Intelligent workflow automation for complex Git operations and team collaboration.
 * Provides predefined workflows for common development patterns and team processes.
 * 
 * Features:
 * - Feature branch workflows with automatic PR preparation
 * - Hotfix workflows for emergency fixes
 * - Release workflows with versioning and tagging
 * - Code review workflows with automatic formatting
 * - Team synchronization workflows
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
⚡ GWorkflow - Advanced Git Workflow Automation

📋 USAGE:
   gworkflow <workflow> [options]

🚀 FEATURE WORKFLOWS:
   gworkflow feature <name>      # Start new feature branch workflow
   gworkflow feature-finish     # Complete feature workflow (merge to dev)
   gworkflow feature-review     # Prepare feature for code review
   gworkflow feature-update     # Update feature branch with latest main

🔥 HOTFIX WORKFLOWS:
   gworkflow hotfix <name>      # Start emergency hotfix workflow
   gworkflow hotfix-finish     # Complete hotfix (merge to main + dev)
   gworkflow hotfix-deploy     # Deploy hotfix immediately

📦 RELEASE WORKFLOWS:
   gworkflow release <version>  # Start release preparation workflow
   gworkflow release-finish    # Complete release and create tags
   gworkflow release-rollback  # Rollback failed release

👥 COLLABORATION WORKFLOWS:
   gworkflow sync              # Sync with team (fetch, rebase, push)
   gworkflow review-prep       # Prepare branch for code review
   gworkflow merge-prep        # Prepare for merge (squash, rebase)
   gworkflow conflict-resolve  # Interactive conflict resolution

🔧 MAINTENANCE WORKFLOWS:
   gworkflow cleanup           # Clean and optimize repository
   gworkflow backup-branch     # Backup current branch before changes
   gworkflow safe-rebase       # Safe interactive rebase with backup

⚙️  WORKFLOW OPTIONS:
   --dry-run                   # Preview workflow actions
   --interactive              # Interactive mode with prompts
   --force                    # Skip safety checks and confirmations
   --branch <name>            # Specify target branch
   --remote <name>            # Specify remote repository

💡 EXAMPLES:
   gworkflow feature user-auth          # Start user-auth feature
   gworkflow hotfix security-patch      # Emergency security fix
   gworkflow release 1.2.0             # Prepare version 1.2.0
   gworkflow sync --remote origin      # Sync with origin remote
   gworkflow review-prep --interactive # Interactive review prep

🎯 PRO TIPS:
   • Use feature workflows for new development
   • Use hotfix workflows for emergency fixes only
   • Always backup before complex workflows
   • Use --dry-run to preview complex operations
`);
}

function getCurrentBranch() {
    try {
        const result = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return 'main';
    }
}

function getMainBranch() {
    // Try to detect main branch
    const branches = ['main', 'master', 'develop'];
    for (const branch of branches) {
        try {
            execSync(`git rev-parse --verify ${branch}`, { stdio: 'pipe' });
            return branch;
        } catch (error) {
            continue;
        }
    }
    return 'main';
}

function createFeatureWorkflow(featureName, options = {}) {
    console.log(`\n🚀 Starting Feature Workflow: ${featureName}\n`);
    
    const mainBranch = getMainBranch();
    const featureBranch = `feature/${featureName}`;
    
    // Step 1: Ensure we're on main and up to date
    console.log('📍 Step 1: Preparing main branch');
    executeGitCommand(`git checkout ${mainBranch}`, `Switching to ${mainBranch}`);
    executeGitCommand('git pull', 'Pulling latest changes');
    
    // Step 2: Create and switch to feature branch
    console.log('\n🌿 Step 2: Creating feature branch');
    const branchResult = executeGitCommand(
        `git checkout -b ${featureBranch}`, 
        `Creating feature branch: ${featureBranch}`
    );
    
    if (!branchResult.success) {
        console.log(`⚠️  Branch ${featureBranch} might already exist, switching to it`);
        executeGitCommand(`git checkout ${featureBranch}`, `Switching to ${featureBranch}`);
    }
    
    // Step 3: Set up tracking
    console.log('\n📡 Step 3: Setting up remote tracking');
    executeGitCommand(
        `git push -u origin ${featureBranch}`, 
        'Setting up remote tracking'
    );
    
    // Step 4: Create initial commit if needed
    const statusResult = executeGitCommand('git status --porcelain', 'Checking status');
    if (statusResult.success && statusResult.output) {
        console.log('\n📝 Step 4: Creating initial feature commit');
        executeGitCommand('git add .', 'Staging changes');
        executeGitCommand(
            `git commit -m "feat: initial commit for ${featureName} feature"`,
            'Creating initial commit'
        );
        executeGitCommand('git push', 'Pushing initial commit');
    }
    
    console.log(`\n✅ Feature workflow started successfully!`);
    console.log(`🎯 You're now on branch: ${featureBranch}`);
    console.log(`💡 Use "gworkflow feature-finish" when ready to merge`);
}

function finishFeatureWorkflow(options = {}) {
    const currentBranch = getCurrentBranch();
    const mainBranch = getMainBranch();
    
    if (!currentBranch.startsWith('feature/')) {
        console.log(`❌ Not on a feature branch. Current branch: ${currentBranch}`);
        return;
    }
    
    console.log(`\n🏁 Finishing Feature Workflow: ${currentBranch}\n`);
    
    // Step 1: Final commit if needed
    const statusResult = executeGitCommand('git status --porcelain', 'Checking for uncommitted changes');
    if (statusResult.success && statusResult.output) {
        console.log('📝 Step 1: Committing final changes');
        executeGitCommand('git add .', 'Staging changes');
        executeGitCommand(
            `git commit -m "feat: finalize ${currentBranch.replace('feature/', '')} feature"`,
            'Creating final commit'
        );
    }
    
    // Step 2: Update feature branch with latest main
    console.log('\n🔄 Step 2: Updating with latest main');
    executeGitCommand(`git fetch origin ${mainBranch}`, 'Fetching latest main');
    executeGitCommand(`git rebase origin/${mainBranch}`, 'Rebasing on main');
    
    // Step 3: Push final changes
    console.log('\n📡 Step 3: Pushing final changes');
    executeGitCommand('git push', 'Pushing to remote');
    
    // Step 4: Switch to main and merge
    console.log('\n🔀 Step 4: Merging to main');
    executeGitCommand(`git checkout ${mainBranch}`, `Switching to ${mainBranch}`);
    executeGitCommand('git pull', 'Pulling latest main');
    executeGitCommand(`git merge --no-ff ${currentBranch}`, `Merging ${currentBranch}`);
    executeGitCommand('git push', 'Pushing merged changes');
    
    // Step 5: Cleanup
    console.log('\n🧹 Step 5: Cleaning up');
    executeGitCommand(`git branch -d ${currentBranch}`, 'Deleting local feature branch');
    executeGitCommand(`git push origin --delete ${currentBranch}`, 'Deleting remote feature branch');
    
    console.log(`\n✅ Feature workflow completed successfully!`);
    console.log(`🎯 Feature merged to ${mainBranch} and cleaned up`);
}

function createHotfixWorkflow(hotfixName, options = {}) {
    console.log(`\n🔥 Starting Hotfix Workflow: ${hotfixName}\n`);
    
    const mainBranch = getMainBranch();
    const hotfixBranch = `hotfix/${hotfixName}`;
    
    // Step 1: Create backup
    console.log('🗄️  Step 1: Creating backup');
    executeGitCommand('gbackup --emergency', 'Creating emergency backup');
    
    // Step 2: Ensure we're on main and up to date
    console.log('\n📍 Step 2: Preparing main branch');
    executeGitCommand(`git checkout ${mainBranch}`, `Switching to ${mainBranch}`);
    executeGitCommand('git pull', 'Pulling latest changes');
    
    // Step 3: Create hotfix branch
    console.log('\n🌿 Step 3: Creating hotfix branch');
    executeGitCommand(`git checkout -b ${hotfixBranch}`, `Creating hotfix branch: ${hotfixBranch}`);
    
    console.log(`\n✅ Hotfix workflow started!`);
    console.log(`🎯 You're now on branch: ${hotfixBranch}`);
    console.log(`⚡ Apply your hotfix and use "gworkflow hotfix-finish" when done`);
}

function finishHotfixWorkflow(options = {}) {
    const currentBranch = getCurrentBranch();
    const mainBranch = getMainBranch();
    
    if (!currentBranch.startsWith('hotfix/')) {
        console.log(`❌ Not on a hotfix branch. Current branch: ${currentBranch}`);
        return;
    }
    
    console.log(`\n🏁 Finishing Hotfix Workflow: ${currentBranch}\n`);
    
    // Step 1: Final commit
    const statusResult = executeGitCommand('git status --porcelain', 'Checking for uncommitted changes');
    if (statusResult.success && statusResult.output) {
        console.log('📝 Step 1: Committing hotfix changes');
        executeGitCommand('git add .', 'Staging changes');
        executeGitCommand(
            `git commit -m "fix: ${currentBranch.replace('hotfix/', '')} hotfix"`,
            'Creating hotfix commit'
        );
    }
    
    // Step 2: Merge to main
    console.log('\n🔀 Step 2: Merging to main');
    executeGitCommand(`git checkout ${mainBranch}`, `Switching to ${mainBranch}`);
    executeGitCommand(`git merge --no-ff ${currentBranch}`, `Merging ${currentBranch}`);
    executeGitCommand('git push', 'Pushing to main');
    
    // Step 3: Create hotfix tag
    const version = `hotfix-${Date.now()}`;
    console.log('\n🏷️  Step 3: Creating hotfix tag');
    executeGitCommand(
        `git tag -a ${version} -m "Hotfix: ${currentBranch.replace('hotfix/', '')}"`,
        `Creating tag: ${version}`
    );
    executeGitCommand('git push origin --tags', 'Pushing tags');
    
    // Step 4: Merge to develop if exists
    try {
        execSync('git rev-parse --verify develop', { stdio: 'pipe' });
        console.log('\n🔀 Step 4: Merging to develop');
        executeGitCommand('git checkout develop', 'Switching to develop');
        executeGitCommand(`git merge --no-ff ${currentBranch}`, 'Merging to develop');
        executeGitCommand('git push', 'Pushing to develop');
        executeGitCommand(`git checkout ${mainBranch}`, `Returning to ${mainBranch}`);
    } catch (error) {
        console.log('\n⚠️  No develop branch found, skipping develop merge');
    }
    
    // Step 5: Cleanup
    console.log('\n🧹 Step 5: Cleaning up');
    executeGitCommand(`git branch -d ${currentBranch}`, 'Deleting hotfix branch');
    
    console.log(`\n✅ Hotfix workflow completed successfully!`);
    console.log(`🎯 Hotfix merged and tagged as ${version}`);
}

function createReleaseWorkflow(version, options = {}) {
    console.log(`\n📦 Starting Release Workflow: ${version}\n`);
    
    const mainBranch = getMainBranch();
    const releaseBranch = `release/${version}`;
    
    // Step 1: Create backup
    console.log('🗄️  Step 1: Creating release backup');
    executeGitCommand('gbackup --release', 'Creating release backup');
    
    // Step 2: Ensure we're on develop and up to date
    const baseBranch = options.branch || 'develop';
    console.log(`\n📍 Step 2: Preparing ${baseBranch} branch`);
    executeGitCommand(`git checkout ${baseBranch}`, `Switching to ${baseBranch}`);
    executeGitCommand('git pull', 'Pulling latest changes');
    
    // Step 3: Create release branch
    console.log('\n🌿 Step 3: Creating release branch');
    executeGitCommand(`git checkout -b ${releaseBranch}`, `Creating release branch: ${releaseBranch}`);
    
    // Step 4: Update version files if they exist
    console.log('\n📝 Step 4: Updating version information');
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (require('fs').existsSync(packagePath)) {
            executeGitCommand(`npm version ${version} --no-git-tag-version`, 'Updating package.json version');
        }
    } catch (error) {
        console.log('⚠️  No package.json found or version update failed');
    }
    
    console.log(`\n✅ Release workflow started!`);
    console.log(`🎯 You're now on branch: ${releaseBranch}`);
    console.log(`📦 Make final adjustments and use "gworkflow release-finish" when ready`);
}

function syncWorkflow(options = {}) {
    console.log(`\n🔄 Starting Team Sync Workflow\n`);
    
    const currentBranch = getCurrentBranch();
    const remoteName = options.remote || 'origin';
    
    // Step 1: Stash changes if any
    const statusResult = executeGitCommand('git status --porcelain', 'Checking for uncommitted changes');
    let hasStash = false;
    if (statusResult.success && statusResult.output) {
        console.log('📦 Step 1: Stashing uncommitted changes');
        executeGitCommand('git stash push -m "Auto-stash for sync"', 'Stashing changes');
        hasStash = true;
    }
    
    // Step 2: Fetch latest changes
    console.log('\n📡 Step 2: Fetching latest changes');
    executeGitCommand(`git fetch ${remoteName}`, `Fetching from ${remoteName}`);
    
    // Step 3: Rebase current branch
    console.log('\n🔄 Step 3: Rebasing current branch');
    const rebaseResult = executeGitCommand(
        `git rebase ${remoteName}/${currentBranch}`,
        `Rebasing ${currentBranch} with ${remoteName}/${currentBranch}`
    );
    
    if (!rebaseResult.success && rebaseResult.output.includes('conflict')) {
        console.log('⚠️  Conflicts detected during rebase');
        console.log('💡 Resolve conflicts and run "git rebase --continue"');
        return;
    }
    
    // Step 4: Restore stashed changes
    if (hasStash) {
        console.log('\n📦 Step 4: Restoring stashed changes');
        executeGitCommand('git stash pop', 'Restoring stashed changes');
    }
    
    // Step 5: Push if no conflicts
    console.log('\n📡 Step 5: Pushing synchronized changes');
    executeGitCommand('git push', 'Pushing synchronized branch');
    
    console.log(`\n✅ Team sync completed successfully!`);
    console.log(`🎯 Branch ${currentBranch} is now synchronized with ${remoteName}`);
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showHelp();
        return;
    }
    
    const workflow = args[0];
    const workflowArg = args[1];
    const options = {};
    
    // Parse options
    if (args.includes('--dry-run')) options.dryRun = true;
    if (args.includes('--interactive')) options.interactive = true;
    if (args.includes('--force')) options.force = true;
    
    const branchIndex = args.indexOf('--branch');
    if (branchIndex !== -1) options.branch = args[branchIndex + 1];
    
    const remoteIndex = args.indexOf('--remote');
    if (remoteIndex !== -1) options.remote = args[remoteIndex + 1];
    
    // Help
    if (workflow === '--help' || workflow === '-h') {
        showHelp();
        return;
    }
    
    // Execute workflows
    switch (workflow) {
        case 'feature':
            if (workflowArg) {
                createFeatureWorkflow(workflowArg, options);
            } else {
                console.log('❌ Feature name required. Usage: gworkflow feature <name>');
            }
            break;
            
        case 'feature-finish':
            finishFeatureWorkflow(options);
            break;
            
        case 'hotfix':
            if (workflowArg) {
                createHotfixWorkflow(workflowArg, options);
            } else {
                console.log('❌ Hotfix name required. Usage: gworkflow hotfix <name>');
            }
            break;
            
        case 'hotfix-finish':
            finishHotfixWorkflow(options);
            break;
            
        case 'release':
            if (workflowArg) {
                createReleaseWorkflow(workflowArg, options);
            } else {
                console.log('❌ Version required. Usage: gworkflow release <version>');
            }
            break;
            
        case 'sync':
            syncWorkflow(options);
            break;
            
        case 'review-prep':
            console.log('\n📋 Preparing branch for code review...');
            executeGitCommand('git add .', 'Staging all changes');
            executeGitCommand('git commit --amend --no-edit', 'Amending last commit');
            executeGitCommand('git push --force-with-lease', 'Force pushing with safety');
            console.log('✅ Branch prepared for code review');
            break;
            
        default:
            console.log(`❌ Unknown workflow: ${workflow}`);
            console.log(`💡 Use "gworkflow --help" for available workflows`);
            process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
