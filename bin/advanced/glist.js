#!/usr/bin/env node

/**
 * GLIST - GitHub MCP Server Tool Explorer
 * 
 * A powerful command to explore all available Git operations in the MCP server.
 * Provides categorized listing, usage examples, and quick reference information.
 * 
 * Usage: glist [options]
 * Options:
 *   --help, -h    Show detailed help information
 *   --category    Show tools by specific category
 *   --simple      Show simple list without examples
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced tool information with categories, examples, and aliases
const TOOLS_CATALOG = {
  'File Operations': {
    description: 'Manage staging area and file tracking',
    tools: [
      { name: 'git-add-all', alias: 'gadd', description: 'Add all modified files to staging', example: 'gadd' },
      { name: 'git-add', alias: 'gadd file.js', description: 'Add specific files to staging', example: 'gadd package.json src/index.ts' },
      { name: 'git-remove', alias: null, description: 'Remove file from staging area', example: 'npm run mcp git-remove unwanted.txt' },
      { name: 'git-remove-all', alias: null, description: 'Remove all files from staging', example: 'npm run mcp git-remove-all' }
    ]
  },
  'Information & History': {
    description: 'Repository status, history, and comparison tools',
    tools: [
      { name: 'git-status', alias: 'gstatus', description: 'Show repository status (staged, modified, untracked)', example: 'gstatus' },
      { name: 'git-log', alias: 'glog', description: 'Display commit history with customizable count', example: 'glog 5' },
      { name: 'git-diff', alias: 'gdiff', description: 'Show differences between versions', example: 'gdiff main' }
    ]
  },
  'Commit & Sync': {
    description: 'Save changes and synchronize with remote repositories',
    tools: [
      { name: 'git-commit', alias: 'gcommit', description: 'Commit staged changes with message', example: 'gcommit "Fix authentication bug"' },
      { name: 'git-push', alias: 'gpush', description: 'Push commits to remote repository', example: 'gpush' },
      { name: 'git-pull', alias: 'gpull', description: 'Pull latest changes from remote', example: 'gpull' }
    ]
  },
  'Branch Management': {
    description: 'Create, switch, and manage git branches',
    tools: [
      { name: 'git-branch', alias: 'gbranch', description: 'List all branches or create new branch', example: 'gbranch feature-auth' },
      { name: 'git-checkout', alias: 'gcheckout', description: 'Switch branches or create and switch', example: 'gcheckout main' }
    ]
  },
  'Remote Management': {
    description: 'Manage remote repository connections',
    tools: [
      { name: 'git-remote-list', alias: 'gremote', description: 'List all configured remote repositories', example: 'gremote' },
      { name: 'git-remote-add', alias: 'gremote-add', description: 'Add new remote repository', example: 'gremote-add origin https://github.com/user/repo.git' },
      { name: 'git-remote-remove', alias: 'gremote-remove', description: 'Remove existing remote repository', example: 'gremote-remove backup' },
      { name: 'git-remote-set-url', alias: 'gremote-set-url', description: 'Change URL of existing remote', example: 'gremote-set-url origin https://new-url.git' }
    ]
  },
  'Advanced Operations': {
    description: 'Stashing, reset, and repository cloning',
    tools: [
      { name: 'git-stash', alias: 'gstash', description: 'Temporarily save current changes', example: 'gstash "WIP: refactoring"' },
      { name: 'git-stash-pop', alias: 'gpop', description: 'Apply and remove most recent stash', example: 'gpop' },
      { name: 'git-reset', alias: 'greset', description: 'Reset repository to specific state', example: 'greset soft HEAD~1' },
      { name: 'git-clone', alias: 'gclone', description: 'Clone repository from remote URL', example: 'gclone https://github.com/user/repo.git' }
    ]
  },
  'Workflow Shortcuts': {
    description: 'Powerful combinations for common Git workflows',
    tools: [
      { name: 'Combined: gflow', alias: 'gflow', description: 'Complete workflow: add → commit → push', example: 'gflow "Implement new feature"' },
      { name: 'Combined: gquick', alias: 'gquick', description: 'Quick commit: add → commit (no push)', example: 'gquick "Fix typo"' },
      { name: 'Combined: gsync', alias: 'gsync', description: 'Sync and status: pull → status', example: 'gsync' },
      { name: 'Combined: gfresh', alias: 'gfresh', description: 'Fresh start: stash → pull → pop → status', example: 'gfresh --safe' }
    ]
  },
  'Developer Workflows': {
    description: 'Advanced workflow automation for daily development',
    tools: [
      { name: 'Combined: gdev', alias: 'gdev', description: 'Developer session management and branch workflows', example: 'gdev feature-auth' },
      { name: 'Combined: gsave', alias: 'gsave', description: 'Quick save workflows with auto-timestamped commits', example: 'gsave --push' },
      { name: 'Combined: gfix', alias: 'gfix', description: 'Quick fix workflows and commit amendments', example: 'gfix "bug fix"' },
      { name: 'Combined: grelease', alias: 'grelease', description: 'Release management with versioning and tagging', example: 'grelease --patch' }
    ]
  },
  'Advanced Workflows': {
    description: 'Professional-grade automation for complex operations',
    tools: [
      { name: 'Combined: gworkflow', alias: 'gworkflow', description: 'Advanced Git workflow automation (feature, hotfix, release)', example: 'gworkflow feature user-auth' },
      { name: 'Combined: gbackup', alias: 'gbackup', description: 'Comprehensive backup and archive workflows', example: 'gbackup --emergency' },
      { name: 'Combined: gclean', alias: 'gclean', description: 'Repository cleanup and maintenance workflows', example: 'gclean --all --backup' }
    ]
  }
};

function showEnhancedHelp() {
  const totalTools = Object.values(TOOLS_CATALOG).reduce((total, category) => total + category.tools.length, 0);
  
  console.log('\n🚀 GLIST - GitHub MCP Server Tool Explorer\n');
  console.log(`📊 Total Available: ${totalTools} Git operations + 18 workflow combinations\n`);
  
  Object.entries(TOOLS_CATALOG).forEach(([categoryName, categoryInfo]) => {
    console.log(`\n📁 ${categoryName}`);
    console.log(`   ${categoryInfo.description}\n`);
    
    categoryInfo.tools.forEach(tool => {
      const aliasInfo = tool.alias && tool.alias !== null ? ` (${tool.alias})` : '';
      console.log(`   ${tool.name.padEnd(18)}${aliasInfo.padEnd(25)} - ${tool.description}`);
      if (tool.example) {
        console.log(`   ${''.padEnd(18)} Example: ${tool.example}`);
      }
      console.log('');
    });
  });
  
  console.log('\n⚡ Usage Methods:');
  console.log('   🔥 Ultra-fast:  gms git-status');
  console.log('   🚀 Aliases:     gstatus');
  console.log('   📋 Full:        npm run mcp git-status');
  console.log('');
  console.log('💡 Pro Tips:');
  console.log('   • Use gstatus before any operation to check current state');
  console.log('   • Use gflow "message" for complete add→commit→push workflow');
  console.log('   • Use glist again anytime to see this comprehensive guide');
  console.log('   • All aliases work from any Git repository after npm link');
  console.log('');
}

function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showEnhancedHelp();
    return 'help';
  }
  
  if (args.includes('--simple')) {
    return 'simple';
  }
  
  const categoryFlag = args.findIndex(arg => arg === '--category');
  if (categoryFlag !== -1 && args[categoryFlag + 1]) {
    return { type: 'category', value: args[categoryFlag + 1] };
  }
  
  return 'enhanced';
}

function showSimpleList() {
  console.log('\n🔧 GitHub MCP Server - Available Tools:\n');
  
  Object.entries(TOOLS_CATALOG).forEach(([categoryName, categoryInfo]) => {
    console.log(`${categoryName}:`);
    categoryInfo.tools.forEach(tool => {
      const aliasInfo = tool.alias && tool.alias !== null ? ` (${tool.alias})` : '';
      console.log(`  ${tool.name}${aliasInfo}`);
    });
    console.log('');
  });
}

function showCategoryTools(categoryName) {
  const category = TOOLS_CATALOG[categoryName];
  if (!category) {
    console.log(`❌ Category "${categoryName}" not found.`);
    console.log('\nAvailable categories:');
    Object.keys(TOOLS_CATALOG).forEach(cat => console.log(`  ${cat}`));
    return;
  }
  
  console.log(`\n📁 ${categoryName}`);
  console.log(`${category.description}\n`);
  
  category.tools.forEach(tool => {
    const aliasInfo = tool.alias && tool.alias !== null ? ` (${tool.alias})` : '';
    console.log(`${tool.name}${aliasInfo}`);
    console.log(`  ${tool.description}`);
    if (tool.example) console.log(`  Example: ${tool.example}`);
    console.log('');
  });
}

// Main execution
const mode = parseArguments();

if (mode === 'help') {
  process.exit(0);
} else if (mode === 'simple') {
  showSimpleList();
  process.exit(0);
} else if (typeof mode === 'object' && mode.type === 'category') {
  showCategoryTools(mode.value);
  process.exit(0);
} else if (mode === 'enhanced') {
  // Show enhanced help by default
  showEnhancedHelp();
  process.exit(0);
}

// Fallback to original MCP CLI list command if needed
const cliPath = path.join(__dirname, '..', '..', 'mcp-cli.js');
const child = spawn('node', [cliPath, 'list'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('❌ Error running glist:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});
