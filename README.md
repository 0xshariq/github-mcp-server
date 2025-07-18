# GitHub MCP Server

## What is this project?

**GitHub MCP Server** is a tool that lets AI assistants (like ChatGPT or custom bots) i## Architecture (How it's built)
- **src/index.ts**: Sets up the MCP server and maps incoming tool requests to Git functions. Well-commented code sections include:
  - Import and server initialization
  - Git staging operations (add/remove files)
  - Repository status & information
  - Commit & sync operations (commit/push/pull)
- **src/github.ts**: Implements all Git operations, with validation and error handling. Organized into logical sections:
  - Utility functions for command execution and validation
  - Git staging operations
  - Repository status & information
  - Commit & sync operations

**Each operation:**
1. Checks if the directory is a Git repo
2. Validates inputs (file existence, etc.)
3. Runs the Git command safely
4. Returns a structured response (success/error/info)
5. Handles errors with meaningful messagesith Git repositories in a safe, structured, and automated way. It acts as a bridge between AI models and Git, exposing common Git operations (add, commit, push, etc.) as easy-to-use tools. This makes it possible for AI to help with coding, version control, and collaboration tasks—without direct shell access.

## Why use it?
- **Safe automation:** AI can manage code changes, commits, and syncs without direct shell or file access.
- **Standardized interface:** Uses the Model Context Protocol (MCP) for consistent, predictable commands.
- **Error handling:** Prevents common mistakes and provides clear feedback.
- **Great for bots, assistants, and automation tools.**

## How does it work? (Step-by-step)
1. **You (or an AI assistant) send a command** (like "add this file" or "commit changes") to the MCP server.
2. **The server checks** that the command is valid and the directory is a Git repository.
3. **The server runs the Git command** (e.g., `git add`, `git commit`) and returns a structured response.
4. **You get a clear result**—success, error, or details about what happened.

## What is the Model Context Protocol (MCP)?
MCP is a protocol that standardizes how tools (like this server) communicate with AI models. It makes it easy for AI to use complex tools safely, with clear inputs and outputs.

---

## Features (What can it do?)
- **Add files** to the staging area (single or all)
- **Remove files** from staging (unstage)
- **Check status** of the repository
- **Commit** changes with custom messages
- **Push/Pull** to/from remote repositories
- **Comprehensive error handling**
- **Works in any directory**

---

## Available Tools (with simple explanations)

### `git-add-all`
> Stage (add) all files in the current directory for commit.
- **Parameters:**
  - `directory` (optional): Where to run the command

### `git-add`
> Stage (add) a specific file for commit.
- **Parameters:**
  - `file` (required): File to add
  - `directory` (optional): Where to run the command

### `git-remove`
> Unstage a specific file (remove from staging area, but not delete).
- **Parameters:**
  - `file` (required): File to unstage
  - `directory` (optional): Where to run the command

### `git-remove-all`
> Unstage all files (remove all from staging area).
- **Parameters:**
  - `directory` (optional): Where to run the command

### `git-status`
> Show which files are changed, staged, or untracked.
- **Parameters:**
  - `directory` (optional): Where to run the command

### `git-commit`
> Commit staged files with a message.
- **Parameters:**
  - `message` (required): Commit message
  - `directory` (optional): Where to run the command

### `git-push`
> Push committed changes to the remote repository.
- **Parameters:**
  - `directory` (optional): Where to run the command

### `git-pull`
> Pull latest changes from the remote repository.
- **Parameters:**
  - `directory` (optional): Where to run the command

---

## Example Usage Scenarios
- **AI code assistant**: Automatically add, commit, and push code changes after generating code.
- **Automated bots**: Keep a repo in sync, or clean up uncommitted changes.
- **Teaching tools**: Let students interact with Git safely via a web interface or chatbot.

---

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
```
2. **Install dependencies:**
```bash
npm install
```
3. **Build the project:**
```bash
npm run build
```

---

## Running the Server

Start the MCP server:
```bash
npm start
```
The server listens for MCP protocol messages on stdin/stdout.

### For development (auto-rebuild):
```bash
npm run dev
```

---

## Project Structure
```
github-mcp-server/
├── src/
│   ├── index.ts      # MCP server setup and tool definitions
│   └── github.ts     # Git operation functions and error handling
├── package.json      # Project configuration
├── tsconfig.json     # TypeScript config
└── README.md         # This file
```

---

## Architecture (How it’s built)
- **src/index.ts**: Sets up the MCP server and maps incoming tool requests to Git functions.
- **src/github.ts**: Implements all Git operations, with validation and error handling.

**Each operation:**
1. Checks if the directory is a Git repo
2. Runs the Git command
3. Returns a structured response (success/error/info)
4. Handles errors (missing files, invalid directories, network issues, etc.)

---

## Code Quality & Documentation
- **Well-commented code**: Both main files include clear, meaningful comments explaining functionality
- **Logical organization**: Code is grouped into related sections for easy navigation
- **TypeScript**: Full type safety with proper interfaces and error handling
- **Modular design**: Separation of concerns between MCP server setup and Git operations
## Error Handling
The server includes comprehensive error handling for:
- File missing? Clear error message.
- Invalid directory? Clear error message.
- Git command fails? Error details provided.
- Network issues (push/pull)? Error details provided.

---

## Requirements
- Node.js 16+
- Git installed and in PATH
- TypeScript (for development)

---

## Dependencies
- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `zod`: Schema validation
- `@types/node`: TypeScript types for Node.js

---

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if possible
5. Submit a pull request

---

## License
ISC License

---

## Author
Created for use with AI assistants that support the Model Context Protocol.
