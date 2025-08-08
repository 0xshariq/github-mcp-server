# 🐳 Easy Docker Guide

Use GitHub MCP Server with Docker - no installation needed! Everything just works.

## 🚀 Super Quick Start

### Option 1: Use Published npm Package (Recommended)
```bash
# Using docker-compose with npm package
docker-compose -f docker-compose.npm.yml up

# Or run directly with npm package
docker run -it --rm node:20-alpine sh -c "
  apk add --no-cache git &&
  npm install -g @0xshariq/github-mcp-server@2.0.1 &&
  github-mcp-server --help
"
```

### Option 2: Build from Source
```bash
# Clone and build
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
docker-compose up --build
```

### Option 3: Pre-built Image (Coming Soon)
```bash
# Will be available after Docker Hub publishing
docker pull 0xshariq/github-mcp-server:2.0.1
docker run -it --rm 0xshariq/github-mcp-server:2.0.1
```

---

## 📁 Working with Your Projects

### Using npm Package Version
```bash
# Go to your project folder first
cd /path/to/your/project

# Run with npm package and mount your project
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  node:20-alpine sh -c "
    apk add --no-cache git &&
    npm install -g @0xshariq/github-mcp-server@2.0.1 &&
    exec sh
  "

# Inside the container, use all commands
gstatus
gadd
gcommit \"your message\"
gpush
```

### Using Built Image
```bash
# Go to your project folder first
cd /path/to/your/project

# Run Docker with access to your files
docker run -it --rm \
  -v $(pwd):/app/workspace \
  -w /app/workspace \
  0xshariq/github-mcp-server:2.0.1

# Now you can use all the git commands on your project
gstatus
gadd
gcommit "your message"
gpush
```

---

## 🎯 What's Included

The Docker image comes with everything ready:
- ✅ Node.js and Git installed
- ✅ All git commands working (`gstatus`, `gadd`, `gcommit`, etc.)
- ✅ MCP server ready to use
- ✅ Safe and secure (runs as non-root user)

---

## � Common Use Cases

### Quick Git Operations
```bash
# Check what changed
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gstatus

# Add and commit files
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gflow "Updated documentation"
```

### Interactive Session
```bash
# Start an interactive session
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest bash

# Now you can run multiple commands
gstatus
gadd
gcommit "my changes"
gpush
exit
```

### VS Code Integration
Add this to your VS Code settings:
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "docker",
      "args": [
        "run", "--rm", 
        "-v", "${workspaceFolder}:/app/workspace", 
        "-w", "/app/workspace", 
        "0xshariq/github-mcp-server:latest", 
        "node", "dist/index.js"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

---

## 🛠️ Build Your Own (Optional)

If you want to build the image yourself:

### 1. Get the Code
```bash
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
```

### 2. Build the Image
```bash
docker build -t my-github-mcp-server .
```

### 3. Run Your Build
```bash
docker run -it --rm my-github-mcp-server
```

---

## 🔧 Advanced Usage

### Create an Alias (Makes Life Easier)
Add this to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# For bash/zsh
alias gmcp='docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest'

# Now you can just use:
gmcp gstatus
gmcp gflow "my commit message"
```

### For Windows PowerShell
```powershell
# Add to your PowerShell profile
function gmcp { 
    docker run -it --rm -v "${PWD}:/app/workspace" -w /app/workspace 0xshariq/github-mcp-server:latest $args 
}

# Usage:
gmcp gstatus
gmcp gflow "my commit message"
```

---

## ❓ Troubleshooting

### Docker not found
**Problem:** `docker` command doesn't work.
**Solution:** Install Docker from [docker.com](https://docker.com/)

### Permission denied
**Problem:** Permission errors on Linux/macOS.
**Solution:** Add your user to docker group:
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

### Files not accessible
**Problem:** Can't see your project files inside container.
**Solution:** Make sure you're in your project directory when running the command:
```bash
cd /path/to/your/project
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest
```

---

## 🎯 Quick Reference

### One-time commands
```bash
# Check status
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gstatus

# Quick commit and push
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest gflow "your message"
```

### Interactive session
```bash
# Start interactive mode
docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest bash

# Then use commands normally
gstatus
gadd
gcommit "message"
gpush
```

That's all you need to know! Docker makes using GitHub MCP Server super easy.
```

## 📁 Working with Your Files

### Mount Your Project Directory
```bash
# Work with files in your current directory
docker run -it --rm \
  -v $(pwd):/app/workspace \
  -w /app/workspace \
  0xshariq/github-mcp-server:latest

# Now git commands work on your local files
cd /app/workspace
gstatus                          # Shows your local git status
```

### Mount Your Git Config (Optional)
```bash
# Use your personal git settings
docker run -it --rm \
  -v $(pwd):/app/workspace \
  -v ~/.gitconfig:/home/mcp/.gitconfig:ro \
  -v ~/.ssh:/home/mcp/.ssh:ro \
  -w /app/workspace \
  0xshariq/github-mcp-server:latest
```

## 🔄 Docker Compose (For Regular Use)

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  github-mcp-server:
    image: 0xshariq/github-mcp-server:latest
    container_name: mcp-server
    volumes:
      - ./:/app/workspace
      - ~/.gitconfig:/home/mcp/.gitconfig:ro
      - ~/.ssh:/home/mcp/.ssh:ro
    working_dir: /app/workspace
    stdin_open: true
    tty: true
```

Then use it:
```bash
# Start the container
docker-compose up -d

# Run commands
docker-compose exec github-mcp-server gstatus
docker-compose exec github-mcp-server gflow "Your commit message"

# Stop when done
docker-compose down
```

## 🛠️ Build Your Own (Advanced)

If you want to modify the Docker image:

```bash
# Clone the repo
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server

# Build your own image
docker build -t my-mcp-server .

# Run your custom image
docker run -it --rm my-mcp-server
```

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check if image exists
docker images | grep github-mcp-server

# Check container logs
docker logs [container-name]

# Try pulling latest image
docker pull 0xshariq/github-mcp-server:latest
```

### Git Commands Not Working
```bash
# Make sure you're in a git repository
cd /app/workspace
git init                         # Initialize if needed

# Check git configuration
git config --list
```

### Permission Issues
```bash
# The container runs as non-root user 'mcp'
# Make sure mounted files are readable
chmod -R 755 your-project-folder
```

## 💡 Pro Tips

### Daily Development Workflow
```bash
# Create an alias for easy access
alias mcp='docker run -it --rm -v $(pwd):/app/workspace -w /app/workspace 0xshariq/github-mcp-server:latest'

# Now you can use it anywhere:
cd ~/my-project
mcp gstatus
mcp gflow "Add new feature"
```

### VS Code Integration
Add to your `.vscode/settings.json`:
```json
{
  "mcpServers": {
    "github-mcp-server": {
      "command": "docker",
      "args": ["run", "--rm", "-v", "${workspaceFolder}:/app/workspace", "-w", "/app/workspace", "0xshariq/github-mcp-server:latest", "node", "dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

## 📖 Next Steps

- ✅ Got Docker working? Check out [DEPLOY.md](DEPLOY.md) for production deployment
- ✅ Want to see all commands? Run `node mcp-cli.js list` inside the container  
- ✅ Need help with git workflows? Check the main [README.md](README.md)

---

🎉 **That's it!** You now have a fully working GitHub MCP Server in Docker!
