# 🚀 Easy Deployment Guide

Simple ways to use GitHub MCP Server anywhere. No complex setup needed!

## ⚡ Easiest Method: NPX (Recommended)

**The absolute simplest way** - no installation, no Docker, always latest version.

### 🎯 For MCP Servers (Claude, VS Code, Cursor, etc.)

Just add this to your MCP configuration:

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

**Where to add this:**
- **Claude Desktop**: `~/.config/claude/claude_desktop_config.json` (or `%APPDATA%\Claude\claude_desktop_config.json` on Windows)
- **VS Code**: `.vscode/mcp.json` in your workspace
- **Cursor**: `~/.cursor/mcp_config.json`
- **Continue**: `~/.continue/config.json`
- **Zed**: `~/.config/zed/settings.json`

**✅ Benefits:**
- ✅ **Zero Installation** - Just works
- ✅ **Always Updated** - Latest version automatically
- ✅ **Cross-Platform** - Works everywhere
- ✅ **No Maintenance** - Set and forget
- ✅ **No Build Required** - Ready instantly

### 📦 For Terminal/CLI Use

```bash
# Run directly without installation
npx -y @0xshariq/github-mcp-server@latest

# Or install globally for permanent access
npm install -g @0xshariq/github-mcp-server
```

---

## 🐳 Docker Hub (Alternative Method)

The GitHub MCP Server is ready to use on Docker Hub:

### 📦 Get the Image
```bash
docker pull 0xshariq/github-mcp-server:latest
```

### � Docker Hub Page
Visit: https://hub.docker.com/r/0xshariq/github-mcp-server

---

## ⚡ Quick Ways to Use It

### 1. Try It Right Now (30 seconds)
```bash
# Just run it - no setup needed
docker run -it --rm 0xshariq/github-mcp-server:latest

# Test these commands inside:
gstatus
glist
```

### 2. Use with Your Git Projects
```bash
# Go to your project folder
cd /path/to/your/project

# Run it with access to your files
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest

# Now you can use git commands on your real project
gstatus
gflow "my commit message"
```

### 3. Make It Easy to Use Daily
Create a simple alias so you don't have to type the long command:

**For Mac/Linux:**
```bash
# Add this to your ~/.bashrc or ~/.zshrc
alias gmcp='docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest'

# Reload your shell
source ~/.bashrc

# Now just use:
gmcp gstatus
gmcp gflow "my changes"
```

**For Windows PowerShell:**
```powershell
# Add this to your PowerShell profile
function gmcp { docker run -it --rm -v "${PWD}:/app/workspace" -w /app/workspace 0xshariq/github-mcp-server:latest $args }

# Now just use:
gmcp gstatus
gmcp gflow "my changes"
```

---

## 🏢 Team/Organization Deployment

### Option 1: Shared Docker Image
Everyone on your team can use the same command:
```bash
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest
```

### Option 2: Create Team Alias
Share this script with your team:

**team-git.sh** (for Mac/Linux):
```bash
#!/bin/bash
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest "$@"
```

**team-git.bat** (for Windows):
```batch
@echo off
docker run -it --rm -v "%CD%:/app/workspace" -w /app/workspace 0xshariq/github-mcp-server:latest %*
```

Usage:
```bash
./team-git.sh gstatus
./team-git.sh gflow "team update"
```

---

## 🌐 CI/CD Integration

### GitHub Actions
Add to your `.github/workflows/main.yml`:
```yaml
name: Git Operations
on: [push, pull_request]

jobs:
  git-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check Git Status
        run: |
          docker run --rm -v ${{ github.workspace }}:/app/workspace -w /app/workspace \
            0xshariq/github-mcp-server:latest gstatus
```

### GitLab CI
Add to your `.gitlab-ci.yml`:
```yaml
git-check:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker run --rm -v $PWD:/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gstatus
```

---

## 🖥️ Server Deployment

### Run as a Service (Linux)
Create `/etc/systemd/system/github-mcp-server.service`:
```ini
[Unit]
Description=GitHub MCP Server
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker run --rm 0xshariq/github-mcp-server:latest
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl enable github-mcp-server
sudo systemctl start github-mcp-server
```

---

## 📱 Different Environments

### Development Environment
```bash
# Quick testing and development
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest bash
```

### Production Environment
```bash
# Automated scripts, no interactive mode
docker run --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gflow "auto deploy"
```

### Testing Environment
```bash
# Safe testing with read-only mount
docker run -it --rm -v $(pwd):/app/workspace:ro -w /app/workspace 0xshariq/github-mcp-server:latest gstatus
```

---

## 🔧 Custom Deployment

### Build Your Own Version
If you want to customize it:

1. **Get the code:**
   ```bash
   git clone https://github.com/0xshariq/github-mcp-server.git
   cd github-mcp-server
   ```

2. **Build your image:**
   ```bash
   docker build -t my-custom-mcp-server .
   ```

3. **Use your custom image:**
   ```bash
   docker run -it --rm my-custom-mcp-server
   ```

---

## ❓ Common Deployment Questions

### Q: Do I need to install anything?
**A:** Just Docker! Everything else is included in the image.

### Q: Can multiple people use the same image?
**A:** Yes! Everyone can use `0xshariq/github-mcp-server:latest`

### Q: Is it safe for production?
**A:** Yes! The image runs as a non-root user and is security-hardened.

### Q: How do I update?
**A:** Just pull the latest image:
```bash
docker pull 0xshariq/github-mcp-server:latest
```

### Q: Can I use it without Docker?
**A:** Yes! Follow the [Installation Guide](INSTALLATION.md) for local installation.

---

## 🎯 Quick Commands Summary

```bash
# Try it now
docker run -it --rm 0xshariq/github-mcp-server:latest

# Use with your project
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest

# Quick status check
docker run --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gstatus

# Quick commit and push
docker run --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gflow "message"
```

That's it! Choose the method that works best for you.
mcp gflow "Fixed bug #123"
```

## 🏢 Production Deployment

### Docker Compose (Teams/Servers)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mcp-server:
    image: 0xshariq/github-mcp-server:latest
    container_name: github-mcp-server
    restart: unless-stopped
    volumes:
      - ./repositories:/app/workspace
      - ~/.gitconfig:/home/mcp/.gitconfig:ro
      - ~/.ssh:/home/mcp/.ssh:ro
    working_dir: /app/workspace
    stdin_open: true
    tty: true
```

Deploy:
```bash
# Start the service
docker-compose up -d

# Use it
docker-compose exec mcp-server gstatus
docker-compose exec mcp-server gflow "Production deployment"

# Stop when not needed
docker-compose down
```

### Kubernetes (Large Scale)

Simple Kubernetes deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-mcp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: github-mcp-server
  template:
    metadata:
      labels:
        app: github-mcp-server
    spec:
      containers:
      - name: mcp-server
        image: 0xshariq/github-mcp-server:latest
        resources:
          limits:
            memory: "256Mi"
            cpu: "200m"
          requests:
            memory: "128Mi"
            cpu: "100m"
```

Deploy:
```bash
kubectl apply -f mcp-deployment.yaml
kubectl exec -it deployment/github-mcp-server -- gstatus
```

## � Configuration Options

### Environment Variables
```bash
# Set git user info
docker run -it --rm \
  -e GIT_USER_NAME="Your Name" \
  -e GIT_USER_EMAIL="you@email.com" \
  0xshariq/github-mcp-server:latest
```

### Mount Your Git Config
```bash
# Use your personal git settings
docker run -it --rm \
  -v ~/.gitconfig:/home/mcp/.gitconfig:ro \
  -v ~/.ssh:/home/mcp/.ssh:ro \
  0xshariq/github-mcp-server:latest
```

## 🎯 Common Use Cases

### 1. CI/CD Pipelines
```bash
# In your CI script
docker run --rm \
  -v $(pwd):/app/workspace \
  -w /app/workspace \
  0xshariq/github-mcp-server:latest \
  gflow "Automated deployment"
```

### 2. Development Teams
```bash
# Everyone uses the same git tools
docker run -it --rm \
  -v ~/team-project:/app/workspace \
  -w /app/workspace \
  0xshariq/github-mcp-server:latest
```

### 3. Learning Git
```bash
# Safe environment to practice git commands
docker run -it --rm 0xshariq/github-mcp-server:latest
# Inside: git init, gadd, gcommit, etc.
```

### 4. VS Code / AI Assistant Integration

**Option A: NPX (Recommended)**
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

**Option B: Docker**
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "docker",
      "args": ["run", "--rm", "-v", "${workspaceFolder}:/app/workspace", "-w", "/app/workspace", "0xshariq/github-mcp-server:latest", "node", "dist/index.js"]
    }
  }
}
```

---

## 🚀 Deployment Comparison

| Method | Ease of Use | Speed | Auto-Updates | Best For |
|--------|-------------|-------|--------------|----------|
| **NPX** | ⭐⭐⭐⭐⭐ Easiest | ⚡ Instant | ✅ Yes | AI assistants, Quick start |
| **Global NPM** | ⭐⭐⭐⭐ Easy | ⚡ Fast | ❌ Manual | Daily CLI usage |
| **Docker** | ⭐⭐⭐ Moderate | ⚡ Fast | ❌ Manual | Isolation, Teams |
| **Manual Build** | ⭐⭐ Complex | 🐢 Slow | ❌ Manual | Development |

**Recommendation:** 
- For MCP servers → Use **NPX**
- For terminal commands → Use **Global NPM**
- For teams/CI/CD → Use **Docker**
- For development → Use **Manual Build**

---

## 🔧 Configuration Options

### Image Won't Pull
```bash
# Make sure Docker is running
docker --version

# Try pulling manually
docker pull 0xshariq/github-mcp-server:latest
```

## 🛠️ Troubleshooting

### NPX Issues

**Problem: "npx command not found"**
```bash
# Update npm to latest version
npm install -g npm@latest

# Verify npx is installed
npx --version
```

**Problem: "NPX is slow on first run"**
- This is normal - npx downloads the package on first use
- Subsequent runs are much faster
- Solution: Use global npm install for frequent use

### Docker Issues

### Image Won't Pull
chmod -R 755 your-project-folder

# Or run with your user ID
docker run --user $(id -u):$(id -g) -it --rm 0xshariq/github-mcp-server:latest
```

### Git Authentication
```bash
# For SSH keys
docker run -v ~/.ssh:/home/mcp/.ssh:ro -it --rm 0xshariq/github-mcp-server:latest

# For HTTPS (use personal access tokens)
git config --global credential.helper store
```

## 📊 What's Included

### ✅ Pre-installed Tools
- Node.js 20 (Alpine Linux)
- Git with all standard commands
- SSH client for git operations
- All 20+ MCP git operations
- Enhanced git aliases (gstatus, gadd, gcommit, etc.)

### 🔒 Security Features
- Runs as non-root user (`mcp`)
- Minimal Alpine Linux base
- No unnecessary packages
- Safe git directory configuration

### � Resource Requirements
- **RAM**: 128MB minimum, 256MB recommended
- **CPU**: Very low usage (0.1 CPU cores)
- **Disk**: 60MB for image, minimal runtime usage

## 📖 Next Steps

- ✅ **Got it working?** Check [DOCKER.md](DOCKER.md) for more Docker tips
- ✅ **Need git help?** See [README.md](README.md) for all available commands
- ✅ **Want examples?** Run `node mcp-cli.js list` inside the container

---

🎉 **Ready to deploy!** Choose the option that fits your needs and start using powerful git operations.
