# Easy Installation Guide

Simple step-by-step installation for GitHub MCP Server. Works on Windows, macOS, and Linux.

## ✅ What You Need

- **Node.js** (version 16 or newer) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- A terminal or command prompt

## MCP SERVER

```bash
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "npx",
      "args": ["-y", "@0xshariq/github-mcp-server@latest"]
    }
  }
}
```

## 🚀 NPM Package Installation (Recommended for cli)

**The easiest way to install GitHub MCP Server from npm registry:**

```bash
# Install globally from npm
npm install -g @0xshariq/github-mcp-server

# Test the installation
gstatus
glist
```

**That's it!** ✅ You now have access to all 29 aliases globally.

### Available Commands After NPM Install:

- **Main commands**: `github-mcp-server`, `gms` (short alias)
- **17 Basic operations**: `gstatus`, `gadd`, `gcommit`, `gpush`, `gpull`, `gbranch`, `gcheckout`, `glog`, `gdiff`, `gstash`, `gpop`, `greset`, `gclone`, `ginit`, `gremote`
- **12 Advanced workflows**: `gflow`, `gquick`, `gsync`, `gdev`, `gworkflow`, `gfix`, `gfresh`, `gbackup`, `gclean`, `gsave`, `glist`, `grelease`, `gtag`, `gmerge`, `grebase`, `gcherry`, `gblame`, `gbisect`

### Update to Latest Version:

```bash
npm update -g @0xshariq/github-mcp-server
```

### Uninstall:

```bash
npm uninstall -g @0xshariq/github-mcp-server
```

---

## 🛠️ Manual Installation (From Source)

## 🛠️ Manual Installation (From Source)

### Step 1: Download the Code

```bash
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
```

### Step 2: Install Everything

```bash
npm install
npm run build
npm link
```

### Step 3: Test It Works

```bash
gstatus
glist
```

**✅ Done!** If you see output from those commands, everything is working.

---

## 🪟 Windows Detailed Steps

### Option 1: PowerShell (Easy Way)

1. **Check if you have Node.js and Git:**

   ```powershell
   node --version
   git --version
   ```

   If these don't work, install them first from the links above.

2. **Download and install:**

   ```powershell
   git clone https://github.com/0xshariq/github-mcp-server.git
   cd github-mcp-server
   npm install
   npm run build
   npm link
   ```

3. **Test it:**
   ```powershell
   gstatus
   ```

### Option 2: Command Prompt

Same commands as PowerShell, just use `cmd` instead.

---

## 🍎 macOS Detailed Steps

### Option 1: Using Terminal (Recommended)

1. **Check if you have everything:**

   ```bash
   node --version
   git --version
   ```

   If missing, install from the links above or use Homebrew:

   ```bash
   brew install node git
   ```

2. **Download and install:**

   ```bash
   git clone https://github.com/0xshariq/github-mcp-server.git
   cd github-mcp-server
   npm install
   npm run build
   npm link
   ```

3. **Test it:**
   ```bash
   gstatus
   ```

---

## 🐧 Linux/WSL Detailed Steps

### For Ubuntu/Debian

1. **Install Node.js and Git:**

   ```bash
   sudo apt update
   sudo apt install nodejs npm git
   ```

2. **Download and install:**

   ```bash
   git clone https://github.com/0xshariq/github-mcp-server.git
   cd github-mcp-server
   npm install
   npm run build
   npm link
   ```

3. **Test it:**
   ```bash
   gstatus
   ```

### For WSL (Windows Subsystem for Linux)

Same steps as Ubuntu/Debian above.

---

## 🔧 MCP Configuration for LLM Clients

After installing via npm or manually, configure your LLM client to use GitHub MCP Server:

### For NPM Installation (Recommended)

**Claude Desktop** (`~/.config/claude/claude_desktop_config.json` or `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "npx",
      "args": ["-y", "@0xshariq/github-mcp-server@latest"]
    }
  }
}
```

**VS Code (Continue Extension)** (`~/.continue/config.json`):

```json
{
  "models": [
    {
      "title": "GitHub MCP Assistant",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "contextLength": 200000,
      "mcpServers": [
        {
          "name": "github-mcp-server",
          "command": "npx",
          "args": ["-y", "@0xshariq/github-mcp-server@latest"],
          "env": {}
        }
      ]
    }
  ]
}
```

**Open WebUI** (Admin Panel → Tools → MCP Servers):

```json
{
  "name": "github-mcp-server",
  "command": "npx",
  "args": ["-y", "@0xshariq/github-mcp-server@latest"],
  "env": {},
  "description": "GitHub MCP Server for Git operations"
}
```

### For Manual Installation (From Source)

**Claude Desktop**:

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

**VS Code Settings** (`.vscode/settings.json`):

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

**Important:** Replace `/absolute/path/to/github-mcp-server` with the real path where you installed it.

---

## ❓ Troubleshooting

### "Command not found" errors

**Problem:** `gstatus` or other commands don't work.

**Solutions:**

1. Make sure you ran `npm link` in the github-mcp-server folder
2. Restart your terminal/command prompt
3. Try running commands with full path: `npx gstatus`

### Permission errors on macOS/Linux

**Problem:** Permission denied when running `npm link`.

**Solution:**

```bash
sudo npm link
```

### Node.js version too old

**Problem:** Error about Node.js version.

**Solution:**

- Download newer Node.js from [nodejs.org](https://nodejs.org/)
- Or use a version manager like nvm

### Git not found

**Problem:** `git` command doesn't work.

**Solution:**

- Download Git from [git-scm.com](https://git-scm.com/)
- Make sure it's added to your PATH

---

## 🎯 What You Get After Installation

After successful installation, you can use these commands anywhere:

### Basic Commands

- `gstatus` - Check repository status
- `gadd` - Add files to staging
- `gcommit "message"` - Commit changes
- `gpush` - Push to remote
- `gpull` - Pull from remote

### Advanced Commands

- `gflow "message"` - Add, commit, and push in one command
- `gdev` - Start development session
- `glist` - See all available commands

### Get Help

- `glist` - Shows all commands with examples
- `glist --help` - More detailed help

---

## 🔄 Updating

To update to the latest version:

```bash
cd github-mcp-server
git pull
npm install
npm run build
```

---

## 🗑️ Uninstalling

To remove GitHub MCP Server:

```bash
npm unlink -g github-mcp-server
rm -rf github-mcp-server
```

That's it! You're ready to use GitHub MCP Server. Try `glist` to see all available commands.
cd github-mcp-server

REM Install and build
npm install
npm run build
npm link

REM Test installation
gstatus
glist

````

### Windows Troubleshooting
```powershell
# If commands not found, check npm global path
npm config get prefix
# Add the returned path\node_modules\.bin to your PATH

# Example PATH addition (adjust path as needed):
$env:PATH += ";C:\Users\YourName\AppData\Roaming\npm"

# Alternative: Use full path
& "C:\Users\YourName\AppData\Roaming\npm\gstatus.cmd"

# Restart PowerShell after PATH changes
````

## 🍎 macOS Installation

### Using Terminal

#### Step 1: Install Prerequisites

```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, install via Homebrew (recommended):
brew install node git

# Or download from https://nodejs.org/
```

#### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server

# Install dependencies and build
npm install
npm run build
```

#### Step 3: Global Installation

```bash
# Install globally (run this INSIDE the github-mcp-server directory)
npm link

# Test installation
gstatus
glist
```

### macOS Troubleshooting

```bash
# If permission issues
sudo npm link

# Check npm global directory
npm config get prefix
# Usually: /usr/local or /opt/homebrew (M1/M2 Macs)

# Add to PATH in ~/.zshrc (default shell) or ~/.bash_profile
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For M1/M2 Macs with Homebrew:
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 🔄 WSL (Windows Subsystem for Linux)

### WSL2 Setup

#### Step 1: Install Prerequisites

```bash
# Update package list
sudo apt update

# Install Node.js via NodeSource (recommended for latest version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Verify installation
node --version
npm --version
git --version
```

#### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server

# Install dependencies and build
npm install
npm run build
```

#### Step 3: Global Installation

```bash
# Install globally (run this INSIDE the github-mcp-server directory)
npm link

# Test installation
gstatus
glist
```

### WSL Integration Tips

```bash
# Access Windows files from WSL
cd /mnt/c/Users/YourName/Documents/projects
gstatus  # Works on Windows projects too!

# Add Windows PATH integration (optional)
echo 'export PATH="$PATH:/mnt/c/Windows/System32"' >> ~/.bashrc
source ~/.bashrc

# Use Windows Git credentials in WSL
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/libexec/git-core/git-credential-manager-core.exe"
```

## 🐧 Linux Installation

### Ubuntu/Debian

#### Step 1: Install Prerequisites

```bash
# Update package list
sudo apt update

# Install Node.js and Git
sudo apt install nodejs npm git

# For latest Node.js version (recommended):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server

# Install dependencies and build
npm install
npm run build
```

#### Step 3: Global Installation

```bash
# Install globally
npm link

# Test installation
gstatus
glist
```

### CentOS/RHEL/Fedora

#### Step 1: Install Prerequisites

```bash
# Fedora
sudo dnf install nodejs npm git

# CentOS/RHEL
sudo yum install nodejs npm git

# For latest Node.js (all distributions):
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs  # Fedora
sudo yum install nodejs  # CentOS/RHEL
```

#### Step 2-3: Same as Ubuntu

Follow steps 2-3 from Ubuntu installation above.

### Arch Linux

#### Step 1: Install Prerequisites

```bash
# Install Node.js and Git
sudo pacman -S nodejs npm git
```

#### Step 2-3: Same as Ubuntu

Follow steps 2-3 from Ubuntu installation above.

## 🐳 Docker Installation (All Platforms)

### Quick Docker Setup

```bash
# Pull the ready-to-use Docker image
docker pull 0xshariq/github-mcp-server:latest

# Run the container
docker run -it --rm 0xshariq/github-mcp-server:latest

# Run with volume mapping (to work with local repositories)
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gstatus
```

### Build from Source (Docker)

```bash
# Clone and build
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server

# Build Docker image
docker build -t github-mcp-server .

# Run the container
docker run -it --rm github-mcp-server
```

## 🔗 VS Code MCP Integration

### Local Installation Setup

Add to your project's `.vscode/settings.json`:

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

**Important:** Replace `/absolute/path/to/github-mcp-server/` with your actual installation path:

- **Windows**: `"C:\\Users\\YourName\\github-mcp-server\\dist\\index.js"`
- **macOS/Linux**: `"/home/username/github-mcp-server/dist/index.js"`
- **WSL**: `"/home/username/github-mcp-server/dist/index.js"`

### Docker Integration Setup

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-v",
        "${workspaceFolder}:/app/workspace",
        "-w",
        "/app/workspace",
        "0xshariq/github-mcp-server:latest",
        "node",
        "dist/index.js"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

### Global VS Code Settings

Add to your global VS Code settings:

- **Windows**: `%APPDATA%\\Code\\User\\settings.json`
- **macOS**: `~/Library/Application Support/Code/User/settings.json`
- **Linux**: `~/.config/Code/User/settings.json`

#### Option 1: Using gms command (Recommended)

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "gms",
      "args": [],
      "env": {},
      "disabled": false
    }
  }
}
```

#### Option 2: Using node directly

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

**Note:** Replace `/absolute/path/to/github-mcp-server` with your actual installation path.

## 🔧 Local vs Global Usage

### Global Usage (After npm link)

```bash
# Works from any directory on your system
cd ~/any-project
gstatus                     # ✅ Global command
gflow "Fix bug"            # ✅ Global workflow
```

### Local Usage (Project-specific)

```bash
# Inside the github-mcp-server directory only
cd /path/to/github-mcp-server
npm run mcp git-status     # ✅ Local command
node mcp-cli.js git-status # ✅ Direct execution
```

### Docker Usage (Platform Independent)

```bash
# Works anywhere Docker is installed
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gstatus
```

## 📍 Important Notes

### Where to run npm link

- **✅ Run `npm link` INSIDE** the `github-mcp-server` project directory
- **❌ Do NOT run** `npm link` in other project directories
- **🎯 Purpose:** Makes all aliases (`gstatus`, `gadd`, `gcommit`, etc.) available globally
- **📍 Location:** Must be executed from `/path/to/github-mcp-server/` directory

### After npm link, you can use aliases from ANY directory:

```bash
cd ~/my-project              # Navigate to any Git repository
gstatus                      # ✅ Works from any location
gadd                         # ✅ Works from any location
gcommit "Fix bug"           # ✅ Works from any location
glist                       # ✅ Works from any location
```

## 🔧 Troubleshooting

### Command Not Found Issues

```bash
# 1. Check if npm link was successful
which gstatus               # Should show path to global command

# 2. If command not found, re-run npm link in correct location
cd /path/to/github-mcp-server
npm link

# 3. Check your PATH includes npm global bin directory
npm config get prefix      # Shows npm global directory
echo $PATH                 # Should include npm global bin path

# 4. Test installation
glist                      # Should show tool explorer
gms git-status            # Should show repository status
```

### Path Issues (Windows)

```powershell
# Add npm global directory to PATH
$npmPath = npm config get prefix
$env:PATH += ";$npmPath"

# Make permanent by adding to system PATH via System Properties
```

### Permission Issues (macOS/Linux)

```bash
# If npm link fails with permission errors
sudo npm link

# Or change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Update Node.js if version is < 16
# Windows: Download from nodejs.org
# macOS: brew upgrade node
# Linux: Follow NodeSource instructions above
```

## ✅ Verification

After installation, verify everything works:

```bash
# Test basic commands
gstatus                     # Should show git status
glist                       # Should show interactive tool explorer
gms git-status             # Should work via MCP interface

# Test in different directories
cd ~
mkdir test-repo
cd test-repo
git init
gstatus                     # Should work from any Git repository
```

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Run `glist` to see available tools
3. Open an issue on [GitHub](https://github.com/0xshariq/github-mcp-server/issues)
4. Include your platform (Windows/macOS/Linux) and error message

## 🔄 Updating

To update to the latest version:

```bash
cd /path/to/github-mcp-server
git pull origin main
npm install
npm run build
# npm link is not needed again if already linked
```

For Docker users:

```bash
docker pull 0xshariq/github-mcp-server:latest
```
