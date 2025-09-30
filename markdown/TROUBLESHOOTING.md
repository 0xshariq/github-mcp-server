# 🛠️ Troubleshooting Guide

This comprehensive guide covers all common issues and solutions discovered during development and deployment of the GitHub MCP Server. Follow these solutions to avoid frustration and get your git aliases working properly.

## 📋 Table of Contents

- [Installation Issues](#-installation-issues)
- [Command Not Found Errors](#-command-not-found-errors)
- [Path and Directory Conflicts](#-path-and-directory-conflicts)
- [PNPM Global Installation Issues](#-pnpm-global-installation-issues)
- [Command Detection Problems](#-command-detection-problems)
- [Shell and Environment Issues](#-shell-and-environment-issues)
- [MCP Server Connection Issues](#-mcp-server-connection-issues)
- [Permission Problems](#-permission-problems)
- [Quick Solutions Summary](#-quick-solutions-summary)

---

## 🚨 Installation Issues

### Problem: Package Not Found After Global Installation

**Symptoms:**
```bash
npm install -g @0xshariq/github-mcp-server
# Installation succeeds but commands not found
gstatus
# bash: gstatus: command not found
```

**Solutions:**

1. **Check if package is properly installed:**
   ```bash
   npm list -g @0xshariq/github-mcp-server
   # or for pnpm
   pnpm list -g @0xshariq/github-mcp-server
   ```

2. **Verify global bin directory is in PATH:**
   ```bash
   npm config get prefix
   # Should show something like /usr/local or /home/user/.npm-global
   echo $PATH | grep $(npm config get prefix)
   ```

3. **For pnpm users, check pnpm bin path:**
   ```bash
   pnpm bin -g
   # Add this to your PATH if not present
   ```

---

## 🔍 Command Not Found Errors

### Problem: "Traceback (most recent call last): ModuleNotFoundError: No module named 'CommandNotFound'"

**Symptoms:**
```bash
gstatus
Traceback (most recent call last):
  File "/usr/lib/command-not-found", line 27, in <module>
    from CommandNotFound.util import crash_guard
ModuleNotFoundError: No module named 'CommandNotFound'
```

**Root Cause:** Ubuntu/WSL's `command-not-found` system conflicts with custom command aliases.

**Solution 1: Disable command-not-found (Recommended)**
```bash
# Add to ~/.bashrc
echo "# Disable command-not-found to fix git aliases" >> ~/.bashrc
echo "unset command_not_found_handle" >> ~/.bashrc
source ~/.bashrc
```

**Solution 2: Use env prefix (Temporary workaround)**
```bash
env gstatus
env gadd --help
env gflow "commit message"
```

**Solution 3: Use full paths (Always works)**
```bash
/home/user/.local/share/pnpm/gstatus
# or wherever your pnpm bin directory is located
```

---

## 📁 Path and Directory Conflicts

### Problem: Module Path Contains Conflicting Numbers

**Symptoms:**
```bash
gflow
Error: Cannot find module '/home/user/desktop/shariq-projects/github-mcp-server/mcp-cli.js'
# Wrong path - should be shariq-mcp-servers, not shariq-projects
```

**Root Cause:** PNPM global directory structure with version numbers (like `/global/5/`) causes path conflicts.

**Complete Solution:**

1. **Remove the version number directory:**
   ```bash
   cd ~/.local/share/pnpm/global
   mv 5/* .
   mv 5/.pnpm .
   rmdir 5
   ```

2. **Update all wrapper scripts:**
   ```bash
   cd ~/.local/share/pnpm
   for cmd in gadd gbackup gbranch gcheckout gclean gclone gcommit gdev gdiff gfix gflow gfresh ginit glist glog gpop gpull gpush gquick grelease gremote greset gsave gstash gstatus gsync gworkflow; do
     sed -i 's|global/5/|global/|g' "$cmd"
   done
   ```

3. **Verify the fix:**
   ```bash
   head -20 ~/.local/share/pnpm/gstatus
   # Should show paths without /5/ in them
   ```

---

## 📦 PNPM Global Installation Issues

### Problem: Incorrect Global Link After Moving Directories

**Symptoms:**
```bash
pnpm list -g
# Shows link to wrong directory path
@0xshariq/github-mcp-server link:../../../../../desktop/shariq-projects/github-mcp-server
```

**Solution:**

1. **Uninstall the incorrect global package:**
   ```bash
   pnpm uninstall -g @0xshariq/github-mcp-server
   ```

2. **Reinstall from correct location:**
   ```bash
   cd /correct/path/to/github-mcp-server
   pnpm install -g @0xshariq/github-mcp-server@latest
   ```

3. **Or install directly from npm registry:**
   ```bash
   pnpm install -g @0xshariq/github-mcp-server@latest
   ```

---

## 🔧 Command Detection Problems

### Problem: Commands Show Main CLI Help Instead of Executing

**Symptoms:**
```bash
gstatus
# Shows:
🚀 MCP Git CLI - Enhanced Git Operations
Usage: mcp-cli <command> [arguments]
# Instead of showing repository status
```

**Root Cause:** The mcp-cli.js script cannot detect the original command name when called through pnpm wrappers.

**Solution: Update Wrapper Scripts to Pass Command Name**

```bash
cd ~/.local/share/pnpm
for cmd in gadd gbackup gbranch gcheckout gclean gclone gcommit gdev gdiff gfix gflow gfresh ginit glist glog gpop gpull gpush gquick grelease gremote greset gsave gstash gstatus gsync gworkflow; do
  sed -i "s|mcp-cli.js\" \"\$@\"|mcp-cli.js\" $cmd \"\$@\"|g" "$cmd"
done
```

**Verify the fix:**
```bash
tail -3 ~/.local/share/pnpm/gstatus
# Should show: mcp-cli.js" gstatus "$@"
```

---

## 🐚 Shell and Environment Issues

### Problem: Commands Work with Full Path but Not as Aliases

**Diagnostic Commands:**
```bash
# Check if command exists
which gstatus
command -v gstatus

# Check PATH
echo $PATH | grep pnpm

# Test with different methods
/full/path/to/gstatus    # Should work
env gstatus              # Should work
gstatus                  # May fail
```

**Solutions:**

1. **Refresh shell hash table:**
   ```bash
   hash -r
   ```

2. **Reload shell configuration:**
   ```bash
   source ~/.bashrc
   # or
   exec bash
   ```

3. **Create manual aliases (if needed):**
   ```bash
   cat >> ~/.bashrc << 'EOF'
   # Git MCP Server Aliases
   alias gstatus='/home/user/.local/share/pnpm/gstatus'
   alias gadd='/home/user/.local/share/pnpm/gadd'
   alias gcommit='/home/user/.local/share/pnpm/gcommit'
   # ... add all other commands
   EOF
   ```

---

## ⚡ gflow Command Usage Issues

### Problem: gflow Treats Commit Message as Files to Add

**Symptoms:**
```bash
gflow "check command fixed"
# Shows: Files to add: check command fixed
# Instead of: Commit message: "check command fixed"
```

**Root Cause:** Command arguments are being parsed incorrectly due to wrapper script issues.

**Solutions:**

1. **Use proper syntax (commit message must be quoted):**
   ```bash
   gflow "your commit message"                    # Add all changes
   gflow "your commit message" file1.js file2.js # Add specific files
   gflow "your commit message" src/ docs/        # Add folders
   ```

2. **Check wrapper script is passing arguments correctly:**
   ```bash
   # Verify gflow wrapper
   tail -3 ~/.local/share/pnpm/gflow
   # Should show: mcp-cli.js" gflow "$@"
   ```

3. **Test with direct call to verify logic:**
   ```bash
   node ~/.local/share/pnpm/global/.pnpm/.../mcp-cli.js gflow "test message"
   ```

**Expected Behavior:**
- First argument = commit message (always quoted)
- Remaining arguments = files/folders to add (optional)
- If no files specified = adds all changes with `git add .`

---

## 🔒 Permission Problems

### Problem: Permission Denied Errors

**Symptoms:**
```bash
gstatus
bash: /home/user/.local/share/pnpm/gstatus: Permission denied
```

**Solution:**
```bash
# Fix permissions for all git aliases
cd ~/.local/share/pnpm
chmod +x g*
# or specifically
chmod +x gadd gbackup gbranch gcheckout gclean gclone gcommit gdev gdiff gfix gflow gfresh ginit glist glog gpop gpull gpush gquick grelease gremote greset gsave gstash gstatus gsync gworkflow
```

---

## 🌐 MCP Server Connection Issues

### Problem: VS Code or AI Assistant Cannot Connect to MCP Server

**Check MCP server is running:**
```bash
cd /path/to/github-mcp-server
node dist/index.js
```

**Common configuration issues:**

1. **Incorrect path in MCP settings:**
   ```json
   {
     "servers": {
       "github-mcp-server": {
         "command": "node",
         "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
         "cwd": "/absolute/path/to/your/project"
       }
     }
   }
   ```

2. **Missing dependencies:**
   ```bash
   cd /path/to/github-mcp-server
   npm install
   npm run build
   ```

---

## ⚡ Quick Solutions Summary

### Immediate Fixes (Copy-Paste Ready)

**1. Fix Command Not Found (Ubuntu/WSL):**
```bash
unset command_not_found_handle
echo "unset command_not_found_handle" >> ~/.bashrc
```

**2. Fix PNPM Path Conflicts:**
```bash
cd ~/.local/share/pnpm/global && mv 5/* . && mv 5/.pnpm . && rmdir 5
cd ~/.local/share/pnpm
for cmd in g*; do [[ -f "$cmd" ]] && sed -i 's|global/5/|global/|g' "$cmd"; done
```

**3. Fix Command Detection:**
```bash
cd ~/.local/share/pnpm
for cmd in gadd gbackup gbranch gcheckout gclean gclone gcommit gdev gdiff gfix gflow gfresh ginit glist glog gpop gpull gpush gquick grelease gremote greset gsave gstash gstatus gsync gworkflow; do
  sed -i "s|mcp-cli.js\" \"\$@\"|mcp-cli.js\" $cmd \"\$@\"|g" "$cmd"
done
```

**4. Test Everything Works:**
```bash
gstatus
gadd --help
gflow --help

# Test gflow with proper syntax:
gflow "test commit message"                    # Adds all changes
gflow "specific files" src/file.js README.md  # Adds only specified files
```

---

## 🆘 Still Having Issues?

### Diagnostic Script

Run this comprehensive diagnostic script:

```bash
#!/bin/bash
echo "=== GitHub MCP Server Diagnostic ==="
echo "Date: $(date)"
echo "OS: $(uname -a)"
echo "Shell: $SHELL"
echo ""

echo "=== Package Installation ==="
echo "Global packages:"
npm list -g @0xshariq/github-mcp-server 2>/dev/null || echo "Not installed via npm"
pnpm list -g @0xshariq/github-mcp-server 2>/dev/null || echo "Not installed via pnpm"
echo ""

echo "=== PATH Configuration ==="
echo "PATH: $PATH"
echo "NPM prefix: $(npm config get prefix)"
echo "PNPM bin: $(pnpm bin -g 2>/dev/null || echo 'pnpm not found')"
echo ""

echo "=== Command Resolution ==="
for cmd in gstatus gadd gcommit gflow; do
  echo "$cmd: $(which $cmd 2>/dev/null || echo 'not found')"
done
echo ""

echo "=== File Permissions ==="
ls -la ~/.local/share/pnpm/g* 2>/dev/null | head -5 || echo "No pnpm commands found"
echo ""

echo "=== Test Commands ==="
echo "Testing gstatus with different methods:"
echo "1. Direct: $(gstatus --help >/dev/null 2>&1 && echo 'OK' || echo 'FAIL')"
echo "2. Env: $(env gstatus --help >/dev/null 2>&1 && echo 'OK' || echo 'FAIL')"
echo "3. Full path: $([[ -f ~/.local/share/pnpm/gstatus ]] && ~/.local/share/pnpm/gstatus --help >/dev/null 2>&1 && echo 'OK' || echo 'FAIL')"
```

### Getting Help

If you're still experiencing issues after trying these solutions:

1. **Create an issue** on [GitHub](https://github.com/0xshariq/github-mcp-server/issues) with:
   - Output of the diagnostic script above
   - Your operating system and shell information
   - Steps you've already tried

2. **Include relevant logs** from:
   - Installation commands
   - Error messages
   - Configuration files

3. **Specify your environment:**
   - OS (Linux/macOS/Windows/WSL)
   - Shell (bash/zsh/fish)
   - Package manager (npm/pnpm/yarn)
   - Node.js version

---

## 📚 Related Documentation

- **[Installation Guide](INSTALLATION.md)** - Step-by-step setup instructions
- **[MCP Configuration](MCP_UNIVERSAL_CONFIG.md)** - Connect with AI assistants
- **[Docker Setup](DOCKER.md)** - Containerized deployment
- **[Quick Reference](QUICK_REFERENCES.md)** - Command cheat sheet

---

*This troubleshooting guide is maintained based on real user experiences and issues. If you discover new problems or solutions, please contribute back to help the community.*