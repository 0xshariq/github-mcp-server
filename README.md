# GitHub MCP Server

A Model Context Protocol (MCP) server that provides Git operations as tools for AI assistants. This server allows AI models to interact with Git repositories through a standardized interface.

## Features

- **Git Add Operations**: Add individual files or all files to staging area
- **Git Remove Operations**: Remove files from staging area (unstage)
- **Git Status**: Check repository status and see changes
- **Git Commit**: Commit staged changes with custom messages
- **Git Push/Pull**: Sync with remote repositories
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Directory Support**: Run operations in specific directories

## Available Tools

### `git-add-all`
Adds all files to the staging area.
- **Parameters**:
  - `directory` (optional): The directory to run the command in

### `git-add`
Adds a specific file to the staging area.
- **Parameters**:
  - `file` (required): The file to add to the staging area
  - `directory` (optional): The directory to run the command in

### `git-remove`
Removes a specific file from the staging area (unstage).
- **Parameters**:
  - `file` (required): The file to remove from the staging area
  - `directory` (optional): The directory to run the command in

### `git-remove-all`
Removes all files from the staging area.
- **Parameters**:
  - `directory` (optional): The directory to run the command in

### `git-status`
Displays the status of the git repository.
- **Parameters**:
  - `directory` (optional): The directory to run the command in

### `git-commit`
Commits staged files with a message.
- **Parameters**:
  - `message` (required): Commit message
  - `directory` (optional): The directory to run the command in

### `git-push`
Pushes committed files to the remote repository.
- **Parameters**:
  - `directory` (optional): The directory to run the command in

### `git-pull`
Pulls changes from the remote repository.
- **Parameters**:
  - `directory` (optional): The directory to run the command in

## Installation

1. Clone the repository:
```bash
git clone https://github.com/0xshariq/github-mcp-server.git
cd github-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

Start the MCP server:
```bash
npm start
```

The server will start and listen for MCP protocol messages on stdin/stdout.

### Development

For development with automatic rebuilding:
```bash
npm run dev
```

## Project Structure

```
github-mcp-server/
├── src/
│   ├── index.ts          # Main MCP server setup and tool definitions
│   └── github.ts         # Git operation functions
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Architecture

The project is organized into two main files:

- **`src/index.ts`**: Contains the MCP server setup and tool definitions that map to the Git functions
- **`src/github.ts`**: Contains all the Git operation functions with proper error handling and validation

Each Git operation:
1. Validates that the target directory is a Git repository
2. Executes the appropriate Git command
3. Returns structured responses with success/error information
4. Includes proper error handling for common scenarios

## Error Handling

The server includes comprehensive error handling for:
- Non-Git repositories
- Missing files
- Invalid directories
- Git command failures
- Network issues (for push/pull operations)

## Requirements

- Node.js 16+ 
- Git installed and available in PATH
- TypeScript for development

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `zod`: Schema validation
- `@types/node`: TypeScript types for Node.js

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Author

Created for use with AI assistants that support the Model Context Protocol.
