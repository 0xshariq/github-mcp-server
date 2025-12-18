# Advanced Git Operations - CLI Aliases

This directory contains 12 advanced Git operation aliases that provide sophisticated workflow automation and power features. Each alias is a standalone executable script with comprehensive functionality for experienced developers and complex development processes.

## Overview

Advanced operations combine multiple Git commands into powerful automation tools designed for professional development workflows, team collaboration, and complex repository management scenarios.

**All 12 Advanced Commands:**
- `gbackup` - Create repository backups and snapshots
- `gclean` - Clean and maintain repository health
- `gdev` - Developer workflow automation
- `gfix` - Smart fix and patch workflows
- `gflow` - Complete add-commit-push workflow
- `gfresh` - Fresh repository setup and reset
- `glist` - Tool discovery and help system
- `gquick` - Quick commit without push
- `grelease` - Release management automation
- `gsave` - Smart save with auto-messaging
- `gsync` - Advanced synchronization
- `gworkflow` - Professional workflow templates

**💡 Pro Tip:** Every command supports `--help` or `-h` for detailed usage information!

## Command Details

### 🛡️ `gbackup` - Repository Backup

**Purpose:** Create comprehensive repository backups with various strategies for data protection and disaster recovery.

**Command:** `gbackup [strategy] [options]`

**Parameters:**
- `[strategy]` - Optional backup strategy (branch, tag, full, incremental)

**Essential Options:**
- `--branch <name>` - Backup specific branch
- `--all-branches` - Backup all branches  
- `--tags` - Include all tags in backup
- `--full` - Complete repository backup
- `--incremental` - Incremental backup since last backup
- `--compress` - Compress backup archives
- `--remote <url>` - Push backup to remote location
- `--verify` - Verify backup integrity after creation
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic backup operations
gbackup                               # Default backup strategy
gbackup --help                       # Show help

# Specific backup types
gbackup --branch main                # Backup main branch only
gbackup --all-branches               # Backup all branches
gbackup --tags                       # Backup with all tags
gbackup --full --compress            # Complete compressed backup

# Advanced backup options
gbackup --incremental                # Incremental since last backup
gbackup --remote backup-server       # Push to backup server
gbackup --verify --compress          # Compressed backup with verification
```

**Backup Strategies:**
- **Branch backup** - Backs up specific branch with history
- **Full backup** - Complete repository including all branches and tags
- **Incremental backup** - Only changes since last backup
- **Tag backup** - Backup specific tagged versions
- **Remote backup** - Push backups to remote storage

**Related Commands:** `gfresh` (restore), `gclean` (maintenance), `grelease` (versioning)
**MCP Tool:** `git_backup`

---

### 🧹 `gclean` - Repository Cleanup

**Purpose:** Clean and maintain repository health with comprehensive cleanup options for optimization and maintenance.

**Command:** `gclean [target] [options]`

**Parameters:**
- `[target]` - Optional cleanup target (branches, cache, files, all)

**Essential Options:**
- `--branches` - Clean merged/stale branches
- `--cache` - Clear Git cache and temporary files
- `--files` - Remove untracked files and directories
- `--all` - Comprehensive cleanup (all targets)
- `--dry-run` - Preview cleanup operations
- `--force` - Force cleanup without confirmation
- `--keep <pattern>` - Keep files matching pattern
- `--aggressive` - Aggressive cleanup including packed refs
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic cleanup operations
gclean --help                        # Show help
gclean                               # Interactive cleanup menu
gclean --dry-run                     # Preview all cleanup operations

# Specific cleanup targets
gclean --branches                    # Clean merged branches
gclean --cache                       # Clear Git cache
gclean --files                       # Remove untracked files
gclean --all                         # Complete cleanup

# Advanced cleanup
gclean --aggressive --force          # Aggressive cleanup without prompts
gclean --branches --keep "main|develop"  # Keep specific branches
```

**Cleanup Targets:**
- **Branches** - Remove merged, stale, or orphaned branches
- **Cache** - Clear Git object cache and temporary files  
- **Files** - Remove untracked files and build artifacts
- **References** - Clean packed references and reflog
- **All** - Comprehensive cleanup of all targets

**Safety Features:**
- Dry-run mode to preview operations
- Confirmation prompts for destructive operations
- Pattern-based exclusions to keep important items
- Backup creation before major cleanups

**Related Commands:** `gbackup` (before cleanup), `gstatus` (check state), `gfresh` (reset)
**MCP Tool:** `git_clean`

---

### 🛠️ `gdev` - Developer Workflow

**Purpose:** Comprehensive developer workflow automation with intelligent session management and team collaboration features.

**Command:** `gdev [branch-name] [options]`

**Parameters:**
- `[branch-name]` - Optional branch name for feature development

**Essential Options:**
- `--status` - Show comprehensive development status
- `--sync` - Synchronize with team's latest changes
- `--continue` - Resume previous development session
- `--start <feature>` - Start new feature development
- `--finish` - Complete current feature development
- `--review` - Prepare code for review
- `--team-sync` - Advanced team synchronization
- `--branch-info` - Detailed branch information
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Development session management
gdev --help                          # Show help
gdev                                 # Check status and sync
gdev --status                        # Comprehensive development status

# Feature development
gdev feature/user-authentication     # Start feature development
gdev --start shopping-cart           # Start new feature branch
gdev --continue                      # Resume previous session
gdev --finish                        # Complete feature development

# Team collaboration
gdev --sync                          # Sync with remote changes
gdev --team-sync                     # Advanced team synchronization
gdev --review                        # Prepare for code review
```

**Workflow Features:**
- **Session Management** - Resume interrupted work sessions
- **Branch Intelligence** - Smart branch creation and switching
- **Team Sync** - Handle complex multi-developer scenarios
- **Status Intelligence** - Comprehensive repository health checks
- **Review Preparation** - Automated code review preparation

**Related Commands:** `gflow` (quick workflow), `gsync` (sync), `gbackup` (safety)
**MCP Tool:** `git_dev`

---

### 🔧 `gfix` - Smart Fix Workflows

**Purpose:** Intelligent fix workflows for different scenarios including hotfixes, patches, and commit corrections.

**Command:** `gfix [issue-type] [options]`

**Parameters:**
- `[issue-type]` - Type of fix (conflicts, commit, branch, history)

**Essential Options:**
- `--conflicts` - Resolve merge conflicts interactively
- `--commit` - Fix/amend previous commit
- `--branch` - Fix branch-related issues
- `--history` - Fix commit history issues
- `--interactive` - Interactive fix mode
- `--force` - Force fixes (use with caution)
- `--dry-run` - Preview fix operations
- `--backup` - Create backup before fixes
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Fix operations
gfix --help                          # Show help
gfix                                 # Interactive fix menu
gfix --conflicts                     # Resolve merge conflicts

# Commit fixes
gfix --commit                        # Fix last commit
gfix --history                       # Interactive history cleanup
gfix --branch                        # Fix branch issues

# Advanced fixes
gfix --interactive --backup          # Interactive fixes with backup
gfix --dry-run --conflicts           # Preview conflict resolution
```

**Fix Types:**
- **Conflicts** - Intelligent merge conflict resolution
- **Commits** - Fix commit messages, authors, dates
- **Branches** - Repair branch relationships and tracking
- **History** - Clean up commit history interactively
- **References** - Fix broken references and remotes

**Related Commands:** `gdev` (development), `gbackup` (safety), `greset` (basic reset)
**MCP Tool:** `git_fix`

---

### ⚡ `gflow` - Complete Workflow

**Purpose:** Execute complete add-commit-push workflow with flexible file handling and intelligent automation.

**Command:** `gflow "message" [files...] [options]`

**Parameters:**
- `"message"` - Required commit message
- `[files...]` - Optional specific files to include

**Essential Options:**
- `--all` - Include all changes (default behavior)
- `--interactive` - Interactive file selection
- `--dry-run` - Preview workflow operations
- `--no-push` - Skip push operation
- `--force-push` - Force push to remote
- `--review` - Create commit for review (no push)
- `--amend` - Amend previous commit
- `--continue` - Continue interrupted workflow
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Complete workflow operations
gflow "feat: add user authentication"           # Full workflow all files
gflow --help                                   # Show help

# Specific file workflows
gflow "fix: update login validation" src/auth.js   # Specific files
gflow "docs: update README" README.md docs/        # Multiple files/dirs

# Workflow variations
gflow "feat: new feature" --review              # Create for review (no push)
gflow "fix: critical bug" --force-push          # Force push after fix
gflow "wip: work in progress" --no-push         # Local commit only

# Interactive workflows
gflow "refactor: component updates" --interactive   # Select files interactively
gflow --continue                                    # Resume interrupted workflow
```

**Workflow Steps:**
1. **Validate Repository** - Ensure clean git state
2. **File Selection** - Add specified files or all changes
3. **Commit Creation** - Create commit with validation
4. **Push Operation** - Upload to remote (unless skipped)
5. **Verification** - Confirm successful completion

**Related Commands:** `gquick` (local commit), `gdev` (development), `gsave` (smart save)
**MCP Tool:** `git_flow`

---

### 🆕 `gfresh` - Fresh Repository Setup

**Purpose:** Reset repository to fresh state with various reset strategies and cleanup options.

**Command:** `gfresh [strategy] [options]`

**Parameters:**
- `[strategy]` - Reset strategy (soft, hard, clean, pristine)

**Essential Options:**
- `--soft` - Keep working directory changes
- `--hard` - Reset everything to clean state
- `--clean` - Remove untracked files
- `--pristine` - Complete fresh start (like new clone)
- `--keep-branches` - Preserve local branches
- `--backup` - Create backup before reset
- `--from-remote` - Reset to match remote state
- `--interactive` - Interactive reset options
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Fresh repository operations
gfresh --help                        # Show help
gfresh                               # Interactive fresh setup
gfresh --clean                       # Remove untracked files

# Reset strategies
gfresh --soft                        # Soft reset keeping changes
gfresh --hard                        # Hard reset to clean state
gfresh --pristine                    # Complete fresh start

# Advanced operations
gfresh --from-remote --backup        # Reset to remote with backup
gfresh --interactive                 # Interactive reset options
```

**Reset Strategies:**
- **Soft** - Reset commits but keep working changes
- **Hard** - Reset everything to clean state
- **Clean** - Remove untracked files and directories
- **Pristine** - Complete reset like fresh clone
- **Remote** - Reset to match remote repository state

**Related Commands:** `gbackup` (before reset), `gclean` (cleanup), `gdev` (development)
**MCP Tool:** `git_fresh`

---

### 📚 `glist` - Tool Discovery

**Purpose:** Comprehensive catalog and help system for all available Git tools with search and filtering capabilities.

**Command:** `glist [options]`

**Essential Options:**
- `--basic` - Show basic aliases only
- `--advanced` - Show advanced aliases only  
- `--category <name>` - Filter by category
- `--search <term>` - Search for specific tools
- `--usage` - Show usage examples
- `--verbose` - Detailed tool information
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Tool discovery
glist                               # Show all available tools
glist --help                       # Show help
glist --basic                      # Basic tools only
glist --advanced                   # Advanced tools only

# Filtering and search
glist --category workflow          # Workflow automation tools
glist --search commit              # Find commit-related tools
glist --usage                      # Show usage examples
```

**Categories:**
- **File Staging & Status** - File management operations
- **Commit Operations** - Commit creation and management
- **Branch Management** - Branch operations
- **Remote Operations** - Remote repository sync
- **History & Recovery** - History and recovery tools
- **Repository Setup** - Repository initialization
- **Workflow Automation** - Advanced workflows
- **Maintenance & Cleanup** - Repository maintenance

**Related Commands:** All Git aliases (provides help for entire system)
**MCP Tool:** `git_list`

---

### ⚡ `gquick` - Quick Commit

**Purpose:** Fast local commit workflow without pushing to remote, perfect for save points and work-in-progress commits.

**Command:** `gquick "message" [options]`

**Parameters:**
- `"message"` - Required commit message

**Essential Options:**
- `--all` - Include all changes (default)
- `--patch` - Interactive patch mode
- `--amend` - Amend previous commit
- `--wip` - Mark as work-in-progress
- `--save-point` - Create development save point
- `--continue-later` - Mark for later completion
- `--dry-run` - Preview commit operation
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Quick commit operations
gquick "fix typo in header"              # Quick local commit
gquick --help                           # Show help

# Work-in-progress commits
gquick "WIP: experimenting with layout" # Work in progress
gquick --wip "testing new approach"     # Explicit WIP marking
gquick --save-point "before refactor"   # Development save point

# Commit variations
gquick --patch "selective changes"      # Interactive staging
gquick --amend "updated commit message" # Amend previous commit
gquick --continue-later "partial work"  # Mark for later completion
```

**Use Cases:**
- **Experimental changes** - Not ready for team sharing
- **Save points** - Frequent saves during development  
- **Work-in-progress** - Incomplete features or fixes
- **Local testing** - Before creating proper commits

**Related Commands:** `gflow` (full workflow), `gsave` (smart save), `gcommit` (basic commit)
**MCP Tool:** `git_quick`

---

### 🚀 `grelease` - Release Management

**Purpose:** Comprehensive release management with versioning, tagging, changelog generation, and deployment preparation.

**Command:** `grelease <version> [options]`

**Parameters:**
- `<version>` - Required version number (semver format)

**Essential Options:**
- `--major` - Major version bump (breaking changes)
- `--minor` - Minor version bump (new features)
- `--patch` - Patch version bump (bug fixes)  
- `--changelog` - Generate/update changelog
- `--notes` - Add release notes
- `--tag-only` - Create tag without release process
- `--dry-run` - Preview release operations
- `--push` - Push release to remote
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Release operations
grelease v1.2.0                     # Create version 1.2.0 release
grelease --help                     # Show help

# Version bumping
grelease --major                    # Major version bump
grelease --minor                    # Minor version bump  
grelease --patch                    # Patch version bump

# Release documentation
grelease v2.0.0 --changelog         # Generate changelog
grelease v1.1.0 --notes "Bug fixes and improvements"  # Add release notes

# Advanced release options
grelease v1.0.0 --dry-run           # Preview release process
grelease v1.3.0 --push              # Create and push release
```

**Release Process:**
1. **Version Validation** - Check semver format and increment
2. **Changelog Generation** - Automatic changelog from commits
3. **Tag Creation** - Create annotated release tags
4. **Release Notes** - Generate or accept custom notes
5. **Remote Push** - Push tags and release info

**Semantic Versioning:**
- **Major (X.0.0)** - Breaking changes requiring updates
- **Minor (1.X.0)** - New features, backwards compatible
- **Patch (1.1.X)** - Bug fixes, no new features

**Related Commands:** `gbackup` (before release), `gclean` (cleanup), `gtag` (tagging)
**MCP Tool:** `git_release`

---

### 💾 `gsave` - Smart Save

**Purpose:** Intelligent save operations with automatic message generation and context awareness for quick development saves.

**Command:** `gsave [message] [options]`

**Parameters:**
- `[message]` - Optional custom save message

**Essential Options:**
- `--auto` - Automatic message generation
- `--wip` - Mark as work-in-progress  
- `--checkpoint` - Create development checkpoint
- `--branch <name>` - Save to specific branch
- `--stash` - Save to stash instead of commit
- `--description <text>` - Add detailed description
- `--continue` - Mark as continuation of previous work
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Smart save operations  
gsave                               # Auto-generate save message
gsave --help                       # Show help
gsave "working on user interface"  # Custom save message

# Save types
gsave --wip                        # Work-in-progress save
gsave --checkpoint                 # Development checkpoint
gsave --auto                       # Automatic message generation

# Advanced saves
gsave --stash "temporary experiment" # Save to stash
gsave --continue "continuing feature work"  # Continuation save
gsave --description "Added login form validation and error handling"
```

**Auto-Message Generation:**
Automatically creates meaningful messages based on:
- **File changes** - Analyzes modified files and content
- **Branch context** - Uses branch name for context
- **Change patterns** - Recognizes common development patterns
- **Previous commits** - Builds on commit history

**Save Types:**
- **Auto save** - Intelligent message generation
- **WIP save** - Work-in-progress markers
- **Checkpoint** - Development milestones  
- **Stash save** - Temporary saves without commits
- **Continuation** - Ongoing work sessions

**Related Commands:** `gquick` (quick commit), `gstash` (basic stash), `gflow` (complete workflow)
**MCP Tool:** `git_save`

---

### 🔄 `gsync` - Advanced Synchronization

**Purpose:** Advanced repository synchronization with conflict resolution, team coordination, and intelligent merging strategies.

**Command:** `gsync [options]`

**Essential Options:**
- `--all` - Sync all branches with remotes
- `--rebase` - Use rebase instead of merge
- `--force` - Force sync operations
- `--conflicts` - Interactive conflict resolution
- `--team` - Team synchronization mode
- `--dry-run` - Preview sync operations
- `--strategy <strategy>` - Merge strategy (ours, theirs, recursive)
- `--prune` - Remove stale remote references
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Synchronization operations
gsync                               # Sync current branch
gsync --help                       # Show help
gsync --all                        # Sync all branches

# Sync strategies  
gsync --rebase                     # Rebase local changes
gsync --conflicts                  # Interactive conflict resolution
gsync --team                       # Team coordination sync

# Advanced sync
gsync --force --prune              # Force sync with cleanup
gsync --dry-run --all              # Preview all branch sync
gsync --strategy recursive         # Use specific merge strategy
```

**Synchronization Features:**
- **Multi-branch sync** - Synchronize multiple branches
- **Conflict resolution** - Interactive conflict handling
- **Team coordination** - Handle team development scenarios
- **Strategy selection** - Choose appropriate merge strategies
- **Remote cleanup** - Prune stale references

**Sync Strategies:**
- **Fast-forward** - Simple fast-forward when possible
- **Merge** - Create merge commits for integration
- **Rebase** - Replay commits on updated base
- **Interactive** - Manual conflict resolution
- **Team** - Coordinate with team workflows

**Related Commands:** `gpull` (basic pull), `gpush` (basic push), `gdev` (development)
**MCP Tool:** `git_sync`

---

### 🔄 `gworkflow` - Professional Workflows

**Purpose:** Professional development workflow templates for enterprise and team environments with standardized processes.

**Command:** `gworkflow <type> <name> [options]`

**Parameters:**
- `<type>` - Workflow type (feature, hotfix, release, bugfix)
- `<name>` - Workflow name/identifier

**Essential Options:**
- `--start` - Start new workflow
- `--finish` - Complete current workflow  
- `--abort` - Abort current workflow
- `--status` - Show workflow status
- `--team` - Team workflow coordination
- `--review` - Prepare for code review
- `--template <name>` - Use specific workflow template
- `--dry-run` - Preview workflow operations
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Workflow operations
gworkflow feature user-authentication    # Start feature workflow
gworkflow --help                        # Show help

# Workflow types
gworkflow hotfix critical-login-bug     # Start hotfix workflow
gworkflow release v2.1.0               # Start release workflow
gworkflow bugfix header-alignment       # Start bugfix workflow

# Workflow management
gworkflow --status                      # Check current workflow
gworkflow --finish                      # Complete workflow
gworkflow --abort                       # Abort current workflow

# Advanced workflows
gworkflow feature api-integration --team    # Team feature workflow
gworkflow hotfix security-patch --review    # Hotfix with review
```

**Workflow Types:**
- **Feature** - New feature development with branch management
- **Hotfix** - Emergency fixes with fast-track process  
- **Release** - Release preparation and versioning
- **Bugfix** - Regular bug fixes with testing
- **Maintenance** - Code maintenance and refactoring

**Workflow Features:**
- **Branch Management** - Automatic branch creation and cleanup
- **Template System** - Standardized workflow templates
- **Team Integration** - Multi-developer coordination
- **Review Process** - Code review preparation
- **Status Tracking** - Workflow progress monitoring

**Related Commands:** `gdev` (development), `grelease` (releases), `gbackup` (safety)
**MCP Tool:** `git_workflow`

---

## Usage Patterns

### Professional Development Workflow
```bash
# Start feature development
gworkflow feature user-dashboard        # Start professional feature workflow
gdev --sync                            # Sync with team changes
# ... development work ...
gsave --checkpoint "UI components done" # Save development checkpoint
gflow "feat: complete user dashboard"   # Complete feature with full workflow
```

### Release Management
```bash
# Prepare for release
gbackup --full                         # Create full backup
gclean --all                          # Clean repository
grelease v1.2.0 --changelog           # Create release with changelog
gsync --all                           # Sync all branches
```

### Emergency Hotfix
```bash
# Emergency fix workflow
gworkflow hotfix critical-security     # Start hotfix workflow
gfix --conflicts                      # Fix any conflicts
gflow "hotfix: security patch"        # Complete hotfix
grelease --patch                      # Create patch release
```

### Repository Maintenance
```bash
# Regular maintenance
gbackup --incremental                 # Create incremental backup
gclean --branches                     # Clean merged branches
gfresh --clean                        # Clean working directory
gsync --prune                         # Clean remote references
```

## Tips and Best Practices

1. **Use workflows for structure**: `gworkflow` for standardized processes
2. **Save frequently**: `gsave` and `gquick` for development checkpoints
3. **Sync regularly**: `gsync` to stay current with team
4. **Backup before major operations**: `gbackup` for safety
5. **Clean regularly**: `gclean` for repository health
6. **Use appropriate tools**: Match tools to specific scenarios

## Error Handling

All advanced aliases include:
- Comprehensive error detection and recovery
- Rollback mechanisms for failed operations  
- Conflict resolution guidance
- Team coordination conflict handling
- Backup creation before destructive operations
- Detailed logging and status reporting

---

## Related Documentation

- [Basic Operations](../basic/README.md)
- [Installation Guide](../../markdown/INSTALLATION.md)
- [Quick Reference](../../markdown/QUICK_REFERENCES.md)

## 📋 Operations Overview

| Category | Operations | Purpose |
|----------|------------|---------|
| **🔄 Workflow Automation** | `gflow`, `gquick`, `gsync` | Multi-step operations in single commands |
| **🛠️ Development Management** | `gdev`, `gfix`, `gfresh` | Smart development session workflows |
| **🚀 Professional Tools** | `gworkflow`, `grelease` | Enterprise-grade development processes |
| **🛡️ Safety & Maintenance** | `gbackup`, `gclean`, `gsave` | Repository health and data protection |
| **📊 Discovery & Analysis** | `glist` | Tool exploration and help system |

## 🔄 Workflow Automation

### `gflow` - Complete Git Flow
**Purpose:** Execute the full git workflow in one command  
**Basic Equivalent:** `gadd` + `gcommit` + `gpush`

```bash
gflow "implement user authentication"   # Stage all → commit → push
gflow "fix: resolve login bug"          # Conventional commit style
gflow "docs: update API documentation"  # Documentation updates
```

**Use cases:**
- Quick commits when all changes are ready
- Small feature implementations
- Bug fixes that don't require staging review

**Safety features:**
- Validates repository state before execution
- Confirms all changes will be committed
- Provides rollback information if push fails

### `gquick` - Quick Commit Workflow
**Purpose:** Fast local commits without pushing  
**Basic Equivalent:** `gadd` + `gcommit`

```bash
gquick "fix typo in header"             # Quick local commit
gquick "WIP: experimenting with layout" # Work-in-progress commits
gquick "save progress before lunch"     # Save points during development
```

**When to use:**
- Experimental changes you're not ready to push
- Frequent save points during development
- Local commits before review/testing

### `gsync` - Synchronization Workflow
**Purpose:** Stay synchronized with remote repository  
**Basic Equivalent:** `gpull` + `gpush`

```bash
gsync                                   # Pull latest, push local commits
gsync --force                           # Force push after rebase
gsync --dry-run                         # Show what would be synchronized
```

**Benefits:**
- Ensures you're working with latest code
- Shares your commits with team
- Handles common merge scenarios automatically

## 🛠️ Development Management

### `gdev` - Development Session Management
**Purpose:** Smart development session workflows with context awareness  
**Features:** Branch management, status checking, team synchronization

```bash
# Session management
gdev                                    # Check status, sync with latest
gdev --status                           # Comprehensive development status
gdev --sync                             # Advanced team synchronization

# Branch workflows
gdev feature-authentication             # Create and setup feature branch
gdev hotfix-login-bug                   # Emergency hotfix branch workflow
gdev --continue                         # Resume previous work session

# Team collaboration
gdev --team-sync                        # Sync with team's latest changes
gdev --branch-info                      # Show detailed branch information
```

**Development session features:**
- **Intelligent status checking** - Shows repository health, conflicts, remote status
- **Smart branch creation** - Creates branches with proper naming and base setup
- **Team synchronization** - Handles complex multi-developer scenarios
- **Work session restoration** - Restores previous work state with stash management

### `gfix` - Smart Fix & Patch Workflows
**Purpose:** Intelligent fix workflows for different scenarios  
**Features:** Context-aware fixes, hotfix procedures, commit amendments

```bash
# Quick fixes
gfix "correct variable name in auth.js" # Smart fix with auto-staging
gfix "update API endpoint URL"          # Single-purpose fixes
gfix --typo                             # Fix typo in last commit message

# Advanced fix workflows
gfix --hotfix "security vulnerability"  # Emergency hotfix branch workflow
gfix --amend                            # Safely amend last commit
gfix --revert HEAD~1                    # Smart revert with confirmation

# Interactive fixes
gfix --interactive                      # Choose files and fix strategy
gfix --patch                            # Patch-mode fixes for partial changes
```

**Hotfix workflow features:**
- Creates dedicated hotfix branch from main/master
- Applies fix with comprehensive testing checks
- Provides merge-back strategy for integration
- Creates backup tags before dangerous operations

### `gfresh` - Fresh Start Workflows
**Purpose:** Repository refresh and cleanup workflows  
**Features:** Safe resets, branch cleanup, workspace preparation

```bash
# Basic fresh start
gfresh                                  # Safe refresh: stash → pull → reset → status
gfresh --hard                           # ⚠️ Hard refresh (discards local changes)
gfresh --safe                           # Ultra-safe with multiple backups

# Branch-specific fresh start
gfresh --branch feature-new             # Fresh start on new branch from main
gfresh --switch main                    # Fresh start by switching to main
gfresh --sync-upstream                  # Refresh from upstream (for forks)

# Workspace preparation
gfresh --clean-workspace                # Clean untracked files and directories
gfresh --reset-config                   # Reset local Git configuration
```

**Safety mechanisms:**
- Always creates stash backup before destructive operations
- Validates remote connectivity before pulls
- Provides detailed preview of changes
- Offers rollback procedures for each operation

## 🚀 Professional Development Tools

### `gworkflow` - Professional Workflow Orchestration
**Purpose:** Complex multi-step workflows for professional development  
**Features:** Feature workflows, release procedures, review preparation

```bash
# Feature development workflows
gworkflow feature auth-system           # Complete feature development lifecycle
gworkflow feature-complete              # Finalize current feature for review

# Release workflows
gworkflow release 1.2.3                # Complete release preparation workflow
gworkflow release-prepare               # Validate and prepare for release
gworkflow hotfix-release 1.2.4         # Emergency hotfix release procedure

# Code review workflows
gworkflow review-prep                   # Prepare branch for code review
gworkflow review-update                 # Update branch based on review feedback
gworkflow merge-prep                    # Prepare for merge to main branch

# Team collaboration workflows
gworkflow sync-team                     # Advanced team synchronization
gworkflow conflict-resolve              # Guided conflict resolution workflow
```

**Feature workflow includes:**
1. **Branch creation** with proper naming conventions
2. **Development environment setup** with team standards
3. **Progressive commit strategies** with conventional commits
4. **Testing integration** and validation checks
5. **Review preparation** with cleanup and documentation
6. **Merge preparation** with conflict resolution

### `grelease` - Release Management System
**Purpose:** Comprehensive release management and versioning  
**Features:** Semantic versioning, release validation, deployment preparation

```bash
# Version management
grelease --patch                        # 1.0.0 → 1.0.1 (bug fixes)
grelease --minor                        # 1.0.0 → 1.1.0 (new features)
grelease --major                        # 1.0.0 → 2.0.0 (breaking changes)
grelease 2.1.0                          # Specific version release

# Release preparation
grelease --prepare                      # Comprehensive release readiness check
grelease --validate                     # Validate current state for release
grelease --preview 1.2.0               # Preview release changes

# Release execution
grelease --create-tag                   # Create release tag with metadata
grelease --generate-notes               # Generate release notes from commits
grelease --deploy-prep                  # Prepare for deployment
```

**Release preparation includes:**
- **Version validation** against semantic versioning rules
- **Dependency checking** for security vulnerabilities
- **Test suite execution** and coverage validation
- **Documentation updates** with changelog generation
- **Tag creation** with comprehensive metadata
- **Deployment preparation** with environment checks

## 🛡️ Safety & Maintenance Tools

### `gbackup` - Comprehensive Backup System
**Purpose:** Multi-layered backup strategies for data protection  
**Features:** Emergency backups, versioned backups, restoration procedures

```bash
# Automatic backup strategies
gbackup                                 # Smart backup (analyzes and chooses strategy)
gbackup --auto                          # Automated backup with timestamp

# Specific backup types
gbackup --branch                        # Create timestamped backup branch
gbackup --tag                           # Create versioned backup tag
gbackup --remote                        # Push backup to remote repository
gbackup --emergency                     # Complete backup: branch + tag + remote

# Backup management
gbackup --list                          # List all available backups
gbackup --list-branches                 # Show backup branches only
gbackup --list-tags                     # Show backup tags only

# Restoration procedures
gbackup --restore                       # Interactive restoration from backups
gbackup --restore-branch backup-20240126 # Restore from specific backup branch
gbackup --restore-tag v1.0.0-backup    # Restore from tagged backup
```

**Backup strategies:**
- **Branch backups** - Create working branches with current state
- **Tag backups** - Immutable snapshots with metadata
- **Remote backups** - Push to remote for off-site storage
- **Emergency backups** - Complete multi-layer backup for critical operations

### `gclean` - Repository Maintenance System
**Purpose:** Repository health management and optimization  
**Features:** Branch cleanup, performance optimization, health monitoring

```bash
# Repository analysis
gclean --stats                          # Comprehensive repository health report
gclean --analyze                        # Deep analysis with recommendations
gclean --size-report                    # Repository size breakdown

# Branch management
gclean --branches                       # Clean merged and stale branches
gclean --branches-dry-run               # Preview branch cleanup
gclean --branches-interactive           # Interactive branch cleanup

# Comprehensive cleanup
gclean --all                            # Complete repository cleanup
gclean --all --backup                   # Complete cleanup with safety backup
gclean --optimize                       # Performance optimization + garbage collection

# Maintenance workflows
gclean --maintenance                    # Scheduled maintenance routine
gclean --health-check                   # Repository health validation
```

**Cleanup procedures:**
- **Merged branch removal** with safety confirmations
- **Stale reference cleanup** for remote tracking branches
- **Garbage collection** for repository optimization
- **Large file identification** and cleanup recommendations
- **Configuration validation** and cleanup

### `gsave` - Smart Save & Preservation
**Purpose:** Intelligent work preservation with context awareness  
**Features:** Smart commits, work-in-progress management, backup integration

```bash
# Smart save operations
gsave                                   # Quick save with auto-generated message
gsave "implementing OAuth integration"  # Save with descriptive message
gsave --auto                            # Automatic save with intelligent messaging

# Work-in-progress management
gsave --wip                             # Mark as work-in-progress
gsave --wip "auth flow partially done"  # WIP with description
gsave --checkpoint                      # Create checkpoint for complex work

# Backup integration
gsave --push                            # Save and push to remote backup
gsave --backup                          # Save with local backup creation
gsave --emergency                       # Save with comprehensive backup
```

**Smart features:**
- **Intelligent commit messages** generated from file changes
- **Work categorization** (feature, fix, docs, etc.)
- **Backup integration** with automatic remote storage
- **Progress tracking** for long-running features

## 📊 Discovery & Analysis Tools

### `glist` - Advanced Tool Discovery System
**Purpose:** Comprehensive tool exploration and help system  
**Features:** Category filtering, usage examples, learning paths

```bash
# Basic discovery
glist                                   # Complete tool catalog with categories
glist --simple                          # Quick list without examples
glist --help                            # Advanced usage options

# Category filtering
glist --category "Workflow"             # Show workflow automation tools
glist --category "Safety"               # Show backup and safety tools
glist --category "Development"          # Show development management tools

# Learning and exploration
glist --basic                           # Show only basic operations
glist --advanced                        # Show only advanced operations
glist --examples                        # Detailed usage examples for all tools
glist --learning-path                   # Suggested learning progression

# Search and filtering
glist --search "commit"                 # Find tools related to commits
glist --tag "emergency"                 # Find emergency/urgent tools
```

**Discovery features:**
- **Organized categories** for logical tool grouping
- **Usage examples** with real-world scenarios
- **Learning paths** for skill progression
- **Search functionality** for specific needs
- **Integration guidance** for combining tools

## 🎓 Professional Development Workflows

### Enterprise Feature Development
```bash
# 1. Start feature development
gdev feature-user-dashboard             # Create feature branch with setup
gbackup --branch                        # Create safety backup

# 2. Development cycle
gsave "initial dashboard layout"        # Save progress points
gfix "correct responsive design"        # Quick fixes during development
gsave --checkpoint                      # Major milestone checkpoint

# 3. Review preparation
gworkflow review-prep                   # Prepare for code review
gclean --analyze                        # Ensure repository health

# 4. Release integration
gworkflow feature-complete              # Finalize feature
grelease --prepare                      # Validate for release
```

### Emergency Hotfix Procedure
```bash
# 1. Emergency backup
gbackup --emergency                     # Complete backup before hotfix

# 2. Hotfix workflow
gfix --hotfix "critical security patch" # Emergency hotfix branch
gsave --emergency                       # Save hotfix with backups

# 3. Validation and deployment
gworkflow hotfix-release 1.2.4         # Hotfix release workflow
grelease --deploy-prep                  # Prepare for emergency deployment
```

### Repository Maintenance Routine
```bash
# 1. Health assessment
gclean --stats                          # Repository health report
gbackup --list                          # Review backup status

# 2. Cleanup and optimization
gclean --branches                       # Clean stale branches
gclean --optimize                       # Performance optimization

# 3. Backup maintenance
gbackup --auto                          # Create fresh backup
gclean --maintenance                    # Scheduled maintenance
```

### Team Synchronization Workflow
```bash
# 1. Team status check
gdev --team-sync                        # Check team synchronization status
gfresh --sync-upstream                  # Sync with upstream (for forks)

# 2. Advanced synchronization
gworkflow sync-team                     # Advanced team sync procedures
gsync --force                           # Force synchronization if needed

# 3. Conflict resolution
gworkflow conflict-resolve              # Guided conflict resolution
gdev --status                           # Verify final synchronization state
```

## 🎯 Learning Path for Advanced Operations

### Prerequisites
- **Master all [basic operations](../basic/README.md)** first
- **Understand Git branching** concepts and workflows
- **Experience with team collaboration** and merge conflicts
- **Familiarity with semantic versioning** and release processes

### Level 1: Workflow Automation
1. **`gflow`** - Master the complete workflow
2. **`gquick`** - Learn quick local commits
3. **`gsync`** - Understand synchronization
4. **`gsave`** - Practice smart work preservation

### Level 2: Development Management  
5. **`gdev`** - Development session management
6. **`gfix`** - Smart fix workflows
7. **`gfresh`** - Repository refresh procedures
8. **`glist`** - Tool discovery and help

### Level 3: Professional Tools
9. **`gworkflow`** - Complex workflow orchestration
10. **`grelease`** - Release management system
11. **`gbackup`** - Comprehensive backup strategies
12. **`gclean`** - Repository maintenance and optimization

## 💡 Pro Tips for Advanced Usage

### Workflow Efficiency
- **Combine operations**: `gdev feature-auth && gsave --checkpoint`
- **Use backup before risky operations**: `gbackup --emergency`
- **Regular maintenance**: Schedule `gclean --maintenance` weekly
- **Smart commits**: Use `gsave` with descriptive messages

### Team Collaboration
- **Start each day**: `gdev --team-sync`
- **Before major changes**: `gbackup --branch`
- **Review preparation**: `gworkflow review-prep`
- **Release coordination**: `grelease --prepare`

### Emergency Procedures
- **Immediate backup**: `gbackup --emergency`
- **Hotfix workflow**: `gfix --hotfix "description"`
- **Safe recovery**: `gbackup --restore`
- **Health check**: `gclean --stats`

## 🔗 Integration with Basic Operations

These advanced tools are designed to work seamlessly with [basic operations](../basic/README.md):

- **`gflow`** enhances `gadd` + `gcommit` + `gpush`
- **`gdev`** builds upon `gstatus` + `gbranch` + `gpull`
- **`gfix`** extends `gcommit` + `greset` capabilities
- **`gbackup`** protects all basic operation workflows

Master the basic operations first, then gradually incorporate these advanced tools to build professional Git workflows that scale with team size and project complexity.
