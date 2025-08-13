# Basic Git Operations - CLI Aliases

This directory contains 15 essential Git operation aliases that provide simplified access to the most commonly used Git commands. Each alias is a standalone executable script with comprehensive help documentation and error handling.

## Overview

Basic operations cover fundamental Git tasks that every developer needs on a daily basis. These commands are designed to be simple, safe, and intuitive while providing access to the most important Git functionality.

**All 15 Basic Commands:**
- `gadd` - Stage files and directories
- `gbranch` - List and create branches  
- `gcheckout` - Switch and create branches
- `gclone` - Clone repositories
- `gcommit` - Create commits with messages
- `gdiff` - Show differences and changes
- `ginit` - Initialize new repositories
- `glog` - View commit history
- `gpop` - Apply stashed changes
- `gpull` - Pull changes from remote
- `gpush` - Push commits to remote
- `gremote` - Manage remote repositories
- `greset` - Reset repository state
- `gstash` - Stash uncommitted changes
- `gstatus` - Show repository status

**💡 Pro Tip:** Every command supports `--help` or `-h` for detailed usage information!

## Command Details

### 📁 `gadd` - Stage Files

**Purpose:** Add files to the staging area in preparation for commit. Supports both specific files and bulk operations with comprehensive file validation.

**Command:** `gadd [files...] [options]`

**Parameters:**
- `[files...]` - Optional list of files/directories to stage (defaults to all changes)

**Essential Options:**
- `-A, --all` - Add all changes including new files and deletions
- `-u, --update` - Add only modified and deleted files (no new files)  
- `-p, --patch` - Interactive patch mode for selective staging
- `-n, --dry-run` - Show what would be added without actually adding
- `-v, --verbose` - Show detailed output of what's being staged
- `-f, --force` - Force add ignored files
- `--ignore-errors` - Continue adding even if some files fail
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic usage
gadd                                    # Stage all changes
gadd --help                            # Show help

# Specific files
gadd src/app.js                        # Stage single file
gadd src/ docs/                        # Stage directories  
gadd "*.js" "*.css"                    # Stage by pattern

# Advanced staging
gadd -p                                # Interactive patch mode
gadd -u                                # Only modified/deleted files
gadd -A                                # All changes including new files
gadd -n                                # Preview what would be added

# Force operations
gadd -f .gitignore                     # Force add ignored file
gadd --ignore-errors src/             # Continue on errors
```

**Related Commands:** `gstatus` (check staging area), `gcommit` (commit staged files), `greset` (unstage files)
**MCP Tool:** `git-add`

---

### 🌿 `gbranch` - Branch Management  

**Purpose:** List existing branches or create new branches with validation and safety checks.

**Command:** `gbranch [branch-name] [options]`

**Parameters:**
- `[branch-name]` - Optional name for new branch to create

**Essential Options:**
- `-a, --all` - Show both local and remote branches
- `-r, --remotes` - Show only remote branches
- `-d, --delete` - Delete specified branch
- `-D, --force-delete` - Force delete branch (even if unmerged)
- `-m, --move` - Rename current branch
- `-c, --copy` - Copy branch to new name
- `--merged` - Show only merged branches
- `--no-merged` - Show only unmerged branches
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic usage
gbranch                               # List all local branches
gbranch --help                       # Show help

# Branch listing
gbranch -a                           # Show all branches (local + remote)
gbranch -r                           # Show only remote branches
gbranch --merged                     # Show merged branches
gbranch --no-merged                  # Show unmerged branches

# Branch creation
gbranch feature/new-login            # Create new branch
gbranch hotfix/critical-bug          # Create hotfix branch

# Branch management
gbranch -d old-feature               # Delete merged branch
gbranch -D experimental              # Force delete branch
gbranch -m new-name                  # Rename current branch
gbranch -c backup-branch             # Copy current branch
```

**Related Commands:** `gcheckout` (switch branches), `gstatus` (current branch), `gpush` (push branches)
**MCP Tool:** `git-branch`

---

### ↪️ `gcheckout` - Branch Switching

**Purpose:** Switch between branches or create new branches with automatic validation and safety checks.

**Command:** `gcheckout [branch-name] [options]`

**Parameters:**
- `[branch-name]` - Branch name to switch to or create

**Essential Options:**
- `-b, --new-branch` - Create and switch to new branch
- `-B, --force-branch` - Force create branch (reset if exists)
- `-t, --track` - Set up tracking with remote branch
- `--orphan` - Create orphan branch (no commit history)
- `-f, --force` - Force checkout (discard local changes)
- `-m, --merge` - Merge local changes when switching
- `--detach` - Switch to detached HEAD state
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic usage
gcheckout main                       # Switch to main branch
gcheckout --help                     # Show help

# Branch switching
gcheckout feature/login              # Switch to existing branch
gcheckout -                          # Switch to previous branch
gcheckout --detach HEAD~3            # Switch to detached HEAD

# Branch creation
gcheckout -b feature/new-ui          # Create and switch to new branch  
gcheckout -b hotfix/bug origin/main  # Create branch from remote
gcheckout -B experimental            # Force create branch

# Advanced operations
gcheckout -t origin/feature          # Checkout and track remote branch
gcheckout --orphan gh-pages          # Create orphan branch
gcheckout -f main                    # Force checkout (discard changes)
gcheckout -m feature/update          # Merge local changes when switching
```

**Related Commands:** `gbranch` (manage branches), `gstatus` (check state), `gstash` (save changes)
**MCP Tool:** `git-checkout`

---

### 📥 `gclone` - Repository Cloning

**Purpose:** Clone remote repositories with various options for different use cases and optimization.

**Command:** `gclone <repository-url> [directory] [options]`

**Parameters:**
- `<repository-url>` - Required URL of repository to clone
- `[directory]` - Optional target directory name

**Essential Options:**
- `--depth <num>` - Create shallow clone with limited history
- `--branch <name>` - Clone specific branch
- `--single-branch` - Clone only one branch
- `--bare` - Create bare repository (no working directory)
- `--mirror` - Create mirror clone (includes all refs)
- `--recursive` - Clone with all submodules
- `--jobs <num>` - Number of parallel jobs for submodules
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic cloning
gclone https://github.com/user/repo.git          # Clone repository
gclone --help                                    # Show help

# Specific directory
gclone https://github.com/user/repo.git my-app   # Clone to specific directory

# Optimized cloning
gclone --depth 1 https://github.com/user/repo.git     # Shallow clone (latest commit only)
gclone --branch main https://github.com/user/repo.git # Clone specific branch
gclone --single-branch https://github.com/user/repo.git # Single branch only

# Advanced cloning
gclone --bare https://github.com/user/repo.git    # Bare repository
gclone --mirror https://github.com/user/repo.git  # Mirror clone
gclone --recursive https://github.com/user/repo.git # Include submodules
gclone --jobs 4 --recursive https://github.com/user/repo.git # Parallel submodule clone
```

**Related Commands:** `ginit` (create repository), `gremote` (manage remotes), `gpull` (update)
**MCP Tool:** `git-clone`

---

### 💾 `gcommit` - Create Commits

**Purpose:** Create commits with comprehensive message validation, hooks support, and various commit strategies.

**Command:** `gcommit <message> [options]`

**Parameters:**
- `<message>` - Required commit message

**Essential Options:**
- `-a, --all` - Stage all modified files and commit
- `--amend` - Amend the previous commit
- `--no-verify` - Skip pre-commit and commit-msg hooks
- `--allow-empty` - Create commit even if no changes
- `--signoff` - Add Signed-off-by line
- `-v, --verbose` - Show diff in commit message editor
- `--gpg-sign` - Sign commit with GPG
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic commits
gcommit "Fix login bug"                    # Simple commit message
gcommit --help                            # Show help

# Advanced commits
gcommit "Add user profile feature" --amend # Amend previous commit
gcommit "Emergency fix" --no-verify       # Skip hooks
gcommit "Update docs" --signoff           # Add sign-off

# Comprehensive commits
gcommit -a "Update all modified files"    # Stage all and commit
gcommit --allow-empty "Trigger deployment" # Empty commit
gcommit "Release v1.2.0" --gpg-sign      # Signed commit
gcommit -v "Complex change"               # Verbose mode with diff
```

**Related Commands:** `gadd` (stage files), `gpush` (upload commits), `glog` (view history)
**MCP Tool:** `git-commit`

---

### 🔍 `gdiff` - Show Differences

**Purpose:** Display differences between files, commits, branches, and working directory with various formatting options.

**Command:** `gdiff [options] [paths...]`

**Parameters:**
- `[paths...]` - Optional specific files or paths to compare

**Essential Options:**
- `--staged, --cached` - Show staged changes
- `--name-only` - Show only file names that changed
- `--stat` - Show statistics (additions/deletions)
- `--color-words` - Color changed words instead of lines
- `-w, --ignore-whitespace` - Ignore whitespace changes
- `--unified <num>` - Number of context lines
- `--no-pager` - Don't use pager for output
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic differences
gdiff                                     # Show unstaged changes
gdiff --help                             # Show help

# Specific comparisons
gdiff --staged                           # Show staged changes
gdiff HEAD~1                             # Compare with previous commit
gdiff main feature-branch                # Compare branches
gdiff origin/main HEAD                   # Compare with remote

# Formatted output
gdiff --stat                             # Statistics summary
gdiff --name-only                        # Just file names
gdiff --color-words                      # Word-level highlighting
gdiff -w                                 # Ignore whitespace

# File-specific
gdiff src/app.js                         # Changes in specific file
gdiff HEAD~2 HEAD src/                   # Changes in directory over time
```

**Related Commands:** `gstatus` (overview), `glog` (commit history), `gcheckout` (view versions)
**MCP Tool:** `git-diff`

---

### 🆕 `ginit` - Initialize Repository

**Purpose:** Initialize new Git repositories with various configurations and optional initial setup.

**Command:** `ginit [options]`

**Essential Options:**
- `--bare` - Create bare repository (no working directory)
- `--shared` - Make repository group-writable
- `--template <dir>` - Use custom template directory
- `--separate-git-dir <dir>` - Separate .git directory
- `--initial-branch <name>` - Set initial branch name
- `-q, --quiet` - Suppress output
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic initialization
ginit                                    # Initialize current directory
ginit --help                            # Show help

# Advanced initialization
ginit --bare                            # Bare repository (for servers)
ginit --shared                          # Group-writable repository
ginit --initial-branch main             # Set main as initial branch

# Custom configuration
ginit --template ~/.git-templates        # Use custom template
ginit --separate-git-dir ../git-data     # Separate git directory
ginit -q                                # Quiet initialization
```

**Related Commands:** `gclone` (clone existing), `gremote` (add remotes), `gcommit` (first commit)
**MCP Tool:** `git-init`

---

### 📜 `glog` - Commit History

**Purpose:** Display commit history with various formatting options, filtering, and search capabilities.

**Command:** `glog [options] [paths...]`

**Parameters:**
- `[paths...]` - Optional specific files or paths to show history for

**Essential Options:**
- `--oneline` - Compact one-line format
- `--graph` - Show ASCII graph of branch/merge history
- `--stat` - Show files changed in each commit
- `--patch` - Show full diff for each commit
- `-n <num>` - Limit number of commits shown
- `--since <date>` - Show commits since date
- `--until <date>` - Show commits until date
- `--author <pattern>` - Filter by author
- `--grep <pattern>` - Search commit messages
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic history
glog                                     # Standard commit log
glog --help                             # Show help

# Formatted views
glog --oneline                          # Compact view
glog --graph                            # Visual branch graph
glog --stat                             # Show file statistics
glog --patch                            # Show full changes

# Limited output
glog -10                                # Last 10 commits
glog --since "2 weeks ago"              # Recent commits
glog --until "yesterday"                # Commits until yesterday

# Filtered logs
glog --author "john@example.com"        # Commits by specific author
glog --grep "fix"                       # Commits containing "fix"
glog src/app.js                         # History for specific file
```

**Related Commands:** `gdiff` (compare commits), `gcheckout` (view old versions), `gbranch` (branch history)
**MCP Tool:** `git-log`

---

### 📤 `gpop` - Apply Stash

**Purpose:** Apply previously stashed changes back to the working directory with various application strategies.

**Command:** `gpop [stash-reference] [options]`

**Parameters:**
- `[stash-reference]` - Optional specific stash to apply (defaults to most recent)

**Essential Options:**
- `--index` - Try to recreate index state
- `--keep-index` - Don't remove from stash list after applying
- `--quiet` - Suppress output
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic stash operations
gpop                                    # Apply most recent stash
gpop --help                            # Show help

# Specific stash
gpop stash@{2}                         # Apply specific stash
gpop stash@{0}                         # Apply latest stash explicitly

# Advanced options
gpop --index                           # Recreate staged state
gpop --keep-index                      # Keep stash after applying
gpop --quiet                           # Silent application
```

**Related Commands:** `gstash` (create stash), `gstatus` (check state), `gdiff` (view changes)
**MCP Tool:** `git-stash-pop`

---

### ⬇️ `gpull` - Pull Changes

**Purpose:** Fetch and integrate changes from remote repositories with various strategies and conflict resolution.

**Command:** `gpull [remote] [branch] [options]`

**Parameters:**
- `[remote]` - Optional remote name (defaults to origin)
- `[branch]` - Optional branch name (defaults to current branch)

**Essential Options:**
- `--rebase` - Rebase instead of merge
- `--no-rebase` - Force merge instead of rebase
- `--ff-only` - Only fast-forward merges
- `--no-ff` - Always create merge commit
- `--squash` - Squash commits from remote
- `--strategy <name>` - Use specific merge strategy
- `--verify-signatures` - Verify GPG signatures
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic pulling
gpull                                   # Pull from origin/current-branch
gpull --help                           # Show help

# Specific targets
gpull origin main                      # Pull specific branch
gpull upstream develop                 # Pull from upstream remote

# Merge strategies
gpull --rebase                         # Rebase local commits
gpull --no-rebase                      # Force merge
gpull --ff-only                        # Only if fast-forward possible
gpull --no-ff                          # Always create merge commit

# Advanced options
gpull --squash                         # Squash remote commits
gpull --verify-signatures              # Verify commit signatures
```

**Related Commands:** `gpush` (upload changes), `gstatus` (check conflicts), `gmerge` (manual merge)
**MCP Tool:** `git-pull`

---

### ⬆️ `gpush` - Push Changes

**Purpose:** Upload local commits to remote repositories with various options and safety checks.

**Command:** `gpush [remote] [branch] [options]`

**Parameters:**
- `[remote]` - Optional remote name (defaults to origin)
- `[branch]` - Optional branch name (defaults to current branch)

**Essential Options:**
- `-u, --set-upstream` - Set upstream tracking for branch
- `--force-with-lease` - Force push with safety checks
- `--force` - Force push (dangerous)
- `--dry-run` - Show what would be pushed without pushing
- `--tags` - Push all tags
- `--follow-tags` - Push tags that are reachable from pushed commits
- `--signed` - Sign push certificate
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic pushing
gpush                                   # Push to origin/current-branch
gpush --help                           # Show help

# Specific targets
gpush origin main                      # Push specific branch
gpush upstream feature-x               # Push to upstream remote

# Branch setup
gpush -u origin new-feature            # Set upstream and push
gpush --set-upstream origin develop    # Set upstream tracking

# Safety options
gpush --dry-run                        # Preview push
gpush --force-with-lease               # Safe force push
gpush --force                          # Dangerous force push

# Tags
gpush --tags                           # Push all tags
gpush --follow-tags                    # Push reachable tags
```

**Related Commands:** `gpull` (download changes), `gbranch` (manage branches), `gstatus` (check state)
**MCP Tool:** `git-push`

---

### 🌐 `gremote` - Remote Management

**Purpose:** Manage remote repositories with comprehensive operations for adding, removing, and configuring remotes.

**Command:** `gremote [action] [options]`

**Parameters:**
- `[action]` - Optional action (add, remove, rename, show, set-url)

**Essential Options:**
- `-v, --verbose` - Show remote URLs
- `--add <name> <url>` - Add new remote
- `--remove <name>` - Remove remote
- `--rename <old> <new>` - Rename remote
- `--set-url <name> <url>` - Change remote URL
- `--get-url <name>` - Show remote URL
- `--show <name>` - Show remote details
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic remote operations
gremote                                 # List all remotes
gremote -v                             # List with URLs
gremote --help                         # Show help

# Adding remotes
gremote --add upstream https://github.com/original/repo.git  # Add upstream
gremote --add origin git@github.com:user/repo.git          # Add origin

# Managing remotes
gremote --remove old-origin            # Remove remote
gremote --rename origin new-origin     # Rename remote
gremote --set-url origin https://github.com/user/new-repo.git # Change URL

# Remote information
gremote --show origin                  # Show remote details
gremote --get-url upstream             # Get remote URL
```

**Related Commands:** `gclone` (clone with remotes), `gpush` (push to remotes), `gpull` (pull from remotes)
**MCP Tool:** `git-remote`

---

### ↩️ `greset` - Reset Repository State

**Purpose:** Reset repository to previous states with various modes and safety options for undoing changes.

**Command:** `greset [mode] [target] [options]`

**Parameters:**
- `[mode]` - Optional reset mode (soft, mixed, hard)
- `[target]` - Optional target commit or reference (defaults to HEAD)

**Essential Options:**
- `--soft` - Keep working directory and index unchanged
- `--mixed` - Keep working directory, reset index (default)
- `--hard` - Reset working directory and index (dangerous)
- `--merge` - Reset but keep local changes
- `--keep` - Reset but keep local changes (safer than --hard)
- `--pathspec-from-file` - Reset specific files from file list
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic reset operations
greset                                  # Reset index to HEAD (unstage all)
greset --help                          # Show help

# Reset modes
greset --soft HEAD~1                   # Undo last commit, keep changes staged
greset --mixed HEAD~1                  # Undo last commit, unstage changes
greset --hard HEAD~1                   # Undo last commit, discard changes

# Specific targets
greset --hard origin/main              # Reset to remote state
greset --soft abc123                   # Reset to specific commit (keep changes)

# File-specific reset
greset src/app.js                      # Unstage specific file
greset HEAD~2 -- docs/                 # Reset specific directory

# Safety options
greset --merge HEAD~1                  # Reset but preserve local changes
greset --keep HEAD~1                   # Keep local modifications
```

**Related Commands:** `gcheckout` (switch states), `gstash` (save changes), `glog` (find commits)
**MCP Tool:** `git-reset`

---

### 📦 `gstash` - Stash Changes

**Purpose:** Temporarily save uncommitted changes with various stashing strategies and management options.

**Command:** `gstash [message] [options]`

**Parameters:**
- `[message]` - Optional descriptive message for the stash

**Essential Options:**
- `-u, --include-untracked` - Include untracked files
- `-a, --all` - Include all files (tracked, untracked, ignored)
- `--keep-index` - Keep staged changes in index
- `--no-keep-index` - Don't keep staged changes (default)
- `--patch` - Interactively select hunks to stash
- `--pathspec-from-file` - Stash files listed in file
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic stashing
gstash                                 # Stash all modified files
gstash "Work in progress on login"     # Stash with message
gstash --help                         # Show help

# Advanced stashing
gstash -u                             # Include untracked files
gstash -a                             # Include all files (even ignored)
gstash --keep-index                   # Keep staged changes

# Interactive stashing
gstash --patch                        # Choose what to stash interactively

# Stash management
gstash list                           # List all stashes
gstash show                           # Show most recent stash
gstash drop                           # Delete most recent stash
gstash clear                          # Delete all stashes
```

**Related Commands:** `gpop` (apply stash), `gstatus` (check changes), `gcheckout` (switch branches)
**MCP Tool:** `git-stash`

---

### 📊 `gstatus` - Repository Status

**Purpose:** Show comprehensive repository status including staged/unstaged changes, branch info, and working directory state.

**Command:** `gstatus [options]`

**Essential Options:**
- `-s, --short` - Show short format status
- `-b, --branch` - Show branch information
- `--porcelain` - Machine-readable format
- `--ignored` - Show ignored files too
- `--untracked-files <mode>` - Control untracked files display
- `--column` - Display in columns
- `-z` - Terminate entries with NUL character
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic status
gstatus                               # Full status display
gstatus --help                       # Show help

# Formatted output
gstatus -s                           # Short status format
gstatus -b                           # Include branch info
gstatus --porcelain                  # Machine-readable format

# Extended information
gstatus --ignored                    # Show ignored files
gstatus --untracked-files=all        # Show all untracked files
gstatus --column                     # Column display format
```

**Related Commands:** `gadd` (stage files), `gcommit` (commit changes), `gdiff` (show changes)
**MCP Tool:** `git-status`

---

## Quick Reference

### Daily Workflow Commands
```bash
gstatus          # Check what changed
gadd .           # Stage all changes  
gcommit "message" # Commit with message
gpush            # Push to remote
```

### Branch Workflow
```bash
gbranch          # List branches
gcheckout -b new # Create new branch
gadd .           # Stage changes
gcommit "update" # Commit changes
gpush -u origin new # Push and set upstream
gcheckout main   # Switch back to main
gpull            # Update main branch
```

### Emergency Operations
```bash
gstash "save work"    # Save current work
gcheckout main        # Switch to main
gpull                 # Get latest changes
gcheckout feature     # Back to feature
gpop                  # Restore work
```

---

## Help and Support

Every command includes comprehensive help:
```bash
<command> --help     # Detailed help for any command
<command> -h         # Short help format
```

**Related Documentation:**
- **Advanced Operations:** See `/bin/advanced/README.md` for power-user features
- **MCP Server:** Full Git operations via Model Context Protocol
- **Installation:** See main project README for setup

**All commands are also available as MCP tools for AI assistants and automation!**
