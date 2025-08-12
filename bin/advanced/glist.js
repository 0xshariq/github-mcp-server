#!/usr/bin/env node

/**
 * glist - Enhanced Git Tools Explorer
 * 
 * Features:
 * - Comprehensive catalog of all available git aliases
 * - Categorized tool listings with descriptions
 * - Usage examples and workflow suggestions
 * - Quick reference and help system
 * - Tool statistics and discovery features
 * 
 * Usage:
 *   glist                    - Show all available tools
 *   glist --basic            - Show basic aliases only
 *   glist --advanced         - Show advanced aliases only
 *   glist --category <name>  - Show specific category
 *   glist --help             - Show this help
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Check if we're in a git repository
function validateRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log(chalk.yellow('⚠️  Not in a git repository - showing tools anyway'));
    return false;
  }
}

// Show help information
function showHelp() {
  console.log(chalk.bold.magenta(`
📚 glist - Enhanced Git Tools Explorer
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('glist')}                      ${chalk.gray('# Show all available tools')}`);
  console.log(`   ${chalk.green('glist --basic')}              ${chalk.gray('# Show basic aliases only')}`);
  console.log(`   ${chalk.green('glist --advanced')}           ${chalk.gray('# Show advanced aliases only')}`);
  console.log(`   ${chalk.green('glist --category staging')}   ${chalk.gray('# Show specific category')}`);
  console.log(`   ${chalk.green('glist --search "commit"')}    ${chalk.gray('# Search for tools')}`);
  console.log(`   ${chalk.green('glist --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 CATEGORIES:'));
  console.log(`   ${chalk.blue('staging')} - File staging and preparation`);
  console.log(`   ${chalk.blue('commits')} - Commit operations and history`);
  console.log(`   ${chalk.blue('branches')} - Branch management`);
  console.log(`   ${chalk.blue('remotes')} - Remote repository operations`);
  console.log(`   ${chalk.blue('workflow')} - Advanced workflow automation`);
  console.log(`   ${chalk.blue('maintenance')} - Repository maintenance`);
  
  console.log(chalk.cyan('\n⚡ FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Complete Catalog:')} All 25+ git aliases with examples`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Usage Examples:')} Real-world usage scenarios`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Workflow Guidance:')} Best practices and workflows`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Quick Reference:')} Fast lookup for any tool`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Tool catalog with enhanced information
const TOOLS_CATALOG = {
  'File Staging': {
    description: 'Tools for staging and preparing files for commits',
    icon: '📁',
    basic: [
      { name: 'gadd', description: 'Stage all or specific files', example: 'gadd', usage: 'gadd [files...]' },
    ],
    advanced: []
  },
  
  'Repository Status': {
    description: 'Check repository state and view changes',
    icon: '📊',
    basic: [
      { name: 'gstatus', description: 'Show repository status', example: 'gstatus', usage: 'gstatus' },
      { name: 'gdiff', description: 'Show file differences', example: 'gdiff', usage: 'gdiff [commit]' },
      { name: 'glog', description: 'View commit history', example: 'glog -5', usage: 'glog [count]' }
    ],
    advanced: []
  },
  
  'Commit Operations': {
    description: 'Create and manage commits',
    icon: '📝',
    basic: [
      { name: 'gcommit', description: 'Create commit with message', example: 'gcommit "fix bug"', usage: 'gcommit "message"' }
    ],
    advanced: [
      { name: 'gquick', description: 'Quick add + commit workflow', example: 'gquick "quick fix"', usage: 'gquick [message]' },
      { name: 'gsave', description: 'Quick save with smart messaging', example: 'gsave --wip', usage: 'gsave [options]' }
    ]
  },
  
  'Branch Management': {
    description: 'Create, switch, and manage branches',
    icon: '🌿',
    basic: [
      { name: 'gbranch', description: 'List or create branches', example: 'gbranch feature-auth', usage: 'gbranch [name]' },
      { name: 'gcheckout', description: 'Switch branches', example: 'gcheckout main', usage: 'gcheckout <branch>' }
    ],
    advanced: [
      { name: 'gdev', description: 'Developer workflow manager', example: 'gdev feature-login', usage: 'gdev [branch-name]' }
    ]
  },
  
  'Remote Operations': {
    description: 'Synchronize with remote repositories',
    icon: '🌐',
    basic: [
      { name: 'gpush', description: 'Push commits to remote', example: 'gpush', usage: 'gpush' },
      { name: 'gpull', description: 'Pull changes from remote', example: 'gpull', usage: 'gpull' },
      { name: 'gremote', description: 'Manage remote connections', example: 'gremote', usage: 'gremote [command]' }
    ],
    advanced: [
      { name: 'gsync', description: 'Advanced synchronization', example: 'gsync --all', usage: 'gsync [options]' }
    ]
  },
  
  'History & Recovery': {
    description: 'Manage commit history and recover changes',
    icon: '⏰',
    basic: [
      { name: 'greset', description: 'Reset repository state', example: 'greset --soft', usage: 'greset [mode]' },
      { name: 'gstash', description: 'Stash uncommitted changes', example: 'gstash', usage: 'gstash [message]' },
      { name: 'gpop', description: 'Restore stashed changes', example: 'gpop', usage: 'gpop' }
    ],
    advanced: [
      { name: 'gbackup', description: 'Create repository backups', example: 'gbackup --branch', usage: 'gbackup [strategy]' }
    ]
  },
  
  'Repository Setup': {
    description: 'Initialize and configure repositories',
    icon: '🏗️',
    basic: [
      { name: 'ginit', description: 'Initialize new repository', example: 'ginit', usage: 'ginit' },
      { name: 'gclone', description: 'Clone remote repository', example: 'gclone user/repo', usage: 'gclone <url>' }
    ],
    advanced: []
  },
  
  'Advanced Workflows': {
    description: 'Complex development workflows and automation',
    icon: '⚡',
    basic: [],
    advanced: [
      { name: 'gworkflow', description: 'Feature/hotfix workflows', example: 'gworkflow feature auth', usage: 'gworkflow <type> <name>' },
      { name: 'gflow', description: 'Complete development workflow', example: 'gflow --review', usage: 'gflow [options]' },
      { name: 'grelease', description: 'Release management', example: 'grelease v1.2.0', usage: 'grelease <version>' }
    ]
  },
  
  'Maintenance': {
    description: 'Repository maintenance and cleanup',
    icon: '🧹',
    basic: [],
    advanced: [
      { name: 'gclean', description: 'Clean repository artifacts', example: 'gclean --branches', usage: 'gclean [options]' },
      { name: 'gfresh', description: 'Fresh repository setup', example: 'gfresh', usage: 'gfresh' },
      { name: 'gfix', description: 'Fix repository issues', example: 'gfix --conflicts', usage: 'gfix [issue]' }
    ]
  }
};

// Get all available tools from filesystem
function getAvailableTools() {
  const tools = { basic: [], advanced: [] };
  
  try {
    const basicPath = path.join(path.dirname(import.meta.url.replace('file://', '')), '..', 'basic');
    const advancedPath = path.join(path.dirname(import.meta.url.replace('file://', '')), '..', 'advanced');
    
    if (fs.existsSync(basicPath)) {
      const basicFiles = fs.readdirSync(basicPath).filter(file => file.endsWith('.js') && !file.includes('README'));
      tools.basic = basicFiles.map(file => file.replace('.js', ''));
    }
    
    if (fs.existsSync(advancedPath)) {
      const advancedFiles = fs.readdirSync(advancedPath).filter(file => file.endsWith('.js') && !file.includes('README') && !file.includes('common'));
      tools.advanced = advancedFiles.map(file => file.replace('.js', ''));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not scan tool directories'));
  }
  
  return tools;
}

// Display tools by category
function displayCategory(categoryName, categoryData, showBasic = true, showAdvanced = true) {
  console.log(chalk.bold.blue(`\n${categoryData.icon} ${categoryName}`));
  console.log(chalk.gray(categoryData.description));
  
  if (showBasic && categoryData.basic.length > 0) {
    console.log(chalk.cyan('\n  📚 Basic Tools:'));
    categoryData.basic.forEach(tool => {
      console.log(chalk.green(`   ${tool.name.padEnd(12)}`), chalk.white(tool.description));
      console.log(chalk.gray(`   ${''.padEnd(12)} Usage: ${tool.usage}`));
      console.log(chalk.gray(`   ${''.padEnd(12)} Example: ${chalk.yellow(tool.example)}`));
    });
  }
  
  if (showAdvanced && categoryData.advanced.length > 0) {
    console.log(chalk.cyan('\n  ⚡ Advanced Tools:'));
    categoryData.advanced.forEach(tool => {
      console.log(chalk.green(`   ${tool.name.padEnd(12)}`), chalk.white(tool.description));
      console.log(chalk.gray(`   ${''.padEnd(12)} Usage: ${tool.usage}`));
      console.log(chalk.gray(`   ${''.padEnd(12)} Example: ${chalk.yellow(tool.example)}`));
    });
  }
}

// Search tools by keyword
function searchTools(keyword) {
  const results = [];
  
  for (const [categoryName, categoryData] of Object.entries(TOOLS_CATALOG)) {
    const allTools = [...categoryData.basic, ...categoryData.advanced];
    
    allTools.forEach(tool => {
      if (tool.name.includes(keyword) || tool.description.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({ ...tool, category: categoryName });
      }
    });
  }
  
  return results;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  // Check repository (optional for this tool)
  const inRepo = validateRepository();
  
  try {
    const basicMode = args.includes('--basic');
    const advancedMode = args.includes('--advanced');
    const categoryArg = args.find(arg => arg === '--category') ? args[args.indexOf('--category') + 1] : null;
    const searchArg = args.find(arg => arg === '--search') ? args[args.indexOf('--search') + 1] : null;
    
    console.log(chalk.bold.magenta('\n📚 Git Tools Explorer'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (inRepo) {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(chalk.blue(`📍 Repository: ${process.cwd().split('/').pop()}`));
      console.log(chalk.blue(`🌿 Current Branch: ${currentBranch}`));
    }
    
    // Get available tools
    const availableTools = getAvailableTools();
    const totalTools = availableTools.basic.length + availableTools.advanced.length;
    
    console.log(chalk.cyan(`\n📊 Tool Summary: ${totalTools} tools available`));
    console.log(chalk.gray(`   • Basic: ${availableTools.basic.length} tools`));
    console.log(chalk.gray(`   • Advanced: ${availableTools.advanced.length} tools`));
    
    if (searchArg) {
      // Search mode
      console.log(chalk.blue(`\n🔍 Search Results for "${searchArg}":`));
      const results = searchTools(searchArg);
      
      if (results.length === 0) {
        console.log(chalk.yellow('   No tools found matching your search'));
      } else {
        results.forEach(tool => {
          console.log(chalk.green(`   ${tool.name.padEnd(12)}`), chalk.white(tool.description));
          console.log(chalk.gray(`   ${''.padEnd(12)} Category: ${tool.category}`));
          console.log(chalk.gray(`   ${''.padEnd(12)} Example: ${chalk.yellow(tool.example)}`));
        });
      }
      
    } else if (categoryArg) {
      // Category mode
      const category = Object.entries(TOOLS_CATALOG).find(([name]) => 
        name.toLowerCase().includes(categoryArg.toLowerCase())
      );
      
      if (category) {
        displayCategory(category[0], category[1], !advancedMode, !basicMode);
      } else {
        console.log(chalk.red(`❌ Category "${categoryArg}" not found`));
        console.log(chalk.cyan('\n💡 Available categories:'));
        Object.keys(TOOLS_CATALOG).forEach(cat => {
          console.log(chalk.gray(`   • ${cat.toLowerCase()}`));
        });
      }
      
    } else {
      // Full listing
      const showBasic = !advancedMode;
      const showAdvanced = !basicMode;
      
      for (const [categoryName, categoryData] of Object.entries(TOOLS_CATALOG)) {
        if ((showBasic && categoryData.basic.length > 0) || (showAdvanced && categoryData.advanced.length > 0)) {
          displayCategory(categoryName, categoryData, showBasic, showAdvanced);
        }
      }
      
      console.log(chalk.cyan('\n💡 Quick Tips:'));
      console.log(chalk.gray('   • Use --help on any tool for detailed information'));
      console.log(chalk.gray('   • Basic tools: everyday git operations'));
      console.log(chalk.gray('   • Advanced tools: workflow automation & power features'));
      console.log(chalk.gray(`   • Search tools: ${chalk.green('glist --search "commit"')}`));
      console.log(chalk.gray(`   • Category filter: ${chalk.green('glist --category staging')}`));
    }
    
    console.log(chalk.gray('\n⚡ Get started: try'), chalk.green('gstatus'), chalk.gray('to check your repository!'));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Tool exploration failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    console.log(chalk.yellow('\n💡 Fallback suggestions:'));
    console.log(chalk.gray(`   • Check your current directory`));
    console.log(chalk.gray(`   • Try: ${chalk.green('glist --help')}`));
    console.log(chalk.gray(`   • Basic tools work anywhere`));
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}