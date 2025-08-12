#!/usr/bin/env node

/**
 * ginit - Enhanced Git Repository Initialization
 * 
 * Features:
 * - Smart repository detection
 * - Interactive setup wizard
 * - Automatic .gitignore creation
 * - Initial branch configuration
 * - Project structure suggestions
 * 
 * Usage:
 *   ginit                   - Initialize new Git repository
 *   ginit --bare            - Create bare repository
 *   ginit --template        - Initialize with common files
 *   ginit --help            - Show this help
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Check if already a git repository
function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Show help information
function showHelp() {
  console.log(chalk.bold.magenta(`
🎯 ginit - Enhanced Git Repository Initialization
`));
  console.log(chalk.cyan('📋 USAGE:'));
  console.log(`   ${chalk.green('ginit')}                      ${chalk.gray('# Initialize new Git repository')}`);
  console.log(`   ${chalk.green('ginit --bare')}               ${chalk.gray('# Create bare repository (for servers)')}`);
  console.log(`   ${chalk.green('ginit --template')}           ${chalk.gray('# Initialize with common project files')}`);
  console.log(`   ${chalk.green('ginit --branch "name"')}      ${chalk.gray('# Set initial branch name')}`);
  console.log(`   ${chalk.green('ginit --help')}               ${chalk.gray('# Show this help message')}`);
  
  console.log(chalk.cyan('\n🎯 FEATURES:'));
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Smart Detection:')} Checks if repository already exists`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Template Support:')} Creates common project files (.gitignore, README)`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Branch Configuration:')} Sets up initial branch with custom name`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Best Practices:')} Follows Git conventions and standards`);
  console.log(`   ${chalk.yellow('•')} ${chalk.white('Quick Start:')} Ready-to-use repository with guidance`);
  
  console.log(chalk.cyan('\n💡 COMMON TEMPLATES:'));
  console.log(`   ${chalk.blue('Node.js:')} Package.json, .gitignore for node_modules`);
  console.log(`   ${chalk.blue('Python:')} Requirements.txt, .gitignore for __pycache__`);
  console.log(`   ${chalk.blue('Web:')} HTML, CSS, JS structure with assets folder`);
  console.log(`   ${chalk.blue('Generic:')} README.md, LICENSE, basic .gitignore`);
  
  console.log(chalk.cyan('\n⚡ WORKFLOW AFTER INIT:'));
  console.log(`   ${chalk.blue('1.')} ${chalk.green('ginit')} - Initialize repository`);
  console.log(`   ${chalk.blue('2.')} ${chalk.green('gadd .')} - Stage all files`);
  console.log(`   ${chalk.blue('3.')} ${chalk.green('gcommit "Initial commit"')} - First commit`);
  console.log(`   ${chalk.blue('4.')} ${chalk.green('gbranch "feature/setup"')} - Create feature branch`);
  
  console.log(chalk.gray('\n═══════════════════════════════════════════════════════════'));
}

// Create common .gitignore patterns
function createGitignore(projectType = 'generic') {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    return false; // Already exists
  }
  
  let content = `# Logs and temporary files
*.log
*.tmp
*.temp
.DS_Store
Thumbs.db

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

  if (projectType === 'node') {
    content += `
# Node.js dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/
.nuxt/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`;
  } else if (projectType === 'python') {
    content += `
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/
.venv/

# Jupyter Notebook
.ipynb_checkpoints
`;
  }

  try {
    fs.writeFileSync(gitignorePath, content);
    return true;
  } catch (error) {
    return false;
  }
}

// Create basic README.md
function createReadme() {
  const readmePath = path.join(process.cwd(), 'README.md');
  
  if (fs.existsSync(readmePath)) {
    return false; // Already exists
  }
  
  const projectName = path.basename(process.cwd());
  const content = `# ${projectName}

A new project initialized with Git.

## Getting Started

This project was initialized using the enhanced Git alias system.

### Prerequisites

- Git
- [Any other requirements for your project]

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd ${projectName}
\`\`\`

2. Install dependencies (if applicable)
\`\`\`bash
# Add your installation commands here
\`\`\`

## Usage

[Add usage instructions here]

## Contributing

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

[Add license information here]
`;

  try {
    fs.writeFileSync(readmePath, content);
    return true;
  } catch (error) {
    return false;
  }
}

// Detect project type based on files in directory
function detectProjectType() {
  const files = fs.readdirSync(process.cwd());
  
  if (files.some(file => file === 'package.json' || file.endsWith('.js') || file.endsWith('.ts'))) {
    return 'node';
  }
  
  if (files.some(file => file.endsWith('.py') || file === 'requirements.txt')) {
    return 'python';
  }
  
  return 'generic';
}

// Run git command with error handling
function runGitCommand(command, successMessage) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (successMessage) {
      console.log(chalk.green(`✅ ${successMessage}`));
    }
    return result;
  } catch (error) {
    console.log(chalk.red(`❌ Git command failed: ${error.message}`));
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Help functionality
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  // Check if already a git repository
  if (isGitRepository()) {
    console.log(chalk.yellow.bold('\n⚠️  Git repository already exists'));
    console.log(chalk.gray('Current directory is already a Git repository'));
    console.log(chalk.cyan('\n💡 Useful commands:'));
    console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
    console.log(chalk.gray(`   • View branches: ${chalk.green('gbranch')}`));
    console.log(chalk.gray(`   • See history: ${chalk.green('glog')}`));
    return;
  }
  
  try {
    const bareMode = args.includes('--bare');
    const templateMode = args.includes('--template');
    const branchName = args.includes('--branch') ? args[args.indexOf('--branch') + 1] : null;
    
    console.log(chalk.bold.magenta('\n🎯 Initializing Git Repository'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue('📁 Location:'), chalk.white(process.cwd()));
    console.log(chalk.blue('📋 Mode:'), chalk.white(bareMode ? 'Bare repository' : 'Standard repository'));
    
    // Initialize repository
    let command = 'git init';
    if (bareMode) {
      command += ' --bare';
    }
    if (branchName) {
      command += ` --initial-branch=${branchName}`;
    }
    
    console.log(chalk.blue('\n🚀 Initializing...'));
    runGitCommand(command, 'Git repository initialized successfully');
    
    if (!bareMode && templateMode) {
      console.log(chalk.blue('\n📝 Creating template files...'));
      
      const projectType = detectProjectType();
      console.log(chalk.blue('🔍 Project type:'), chalk.white(projectType));
      
      // Create .gitignore
      if (createGitignore(projectType)) {
        console.log(chalk.green('✅ Created .gitignore'));
      } else {
        console.log(chalk.yellow('⚠️  .gitignore already exists'));
      }
      
      // Create README.md
      if (createReadme()) {
        console.log(chalk.green('✅ Created README.md'));
      } else {
        console.log(chalk.yellow('⚠️  README.md already exists'));
      }
    }
    
    console.log(chalk.green.bold('\n🎉 Repository ready!'));
    
    if (!bareMode) {
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.gray(`   • Check status: ${chalk.green('gstatus')}`));
      console.log(chalk.gray(`   • Add files: ${chalk.green('gadd .')}`));
      console.log(chalk.gray(`   • First commit: ${chalk.green('gcommit "Initial commit"')}`));
      console.log(chalk.gray(`   • Create branch: ${chalk.green('gbranch "feature/setup"')}`));
      
      if (templateMode) {
        console.log(chalk.gray(`   • Edit README.md to describe your project`));
        console.log(chalk.gray(`   • Update .gitignore for your specific needs`));
      }
    } else {
      console.log(chalk.cyan('\n💡 Bare repository created for:'));
      console.log(chalk.gray('   • Server-side Git hosting'));
      console.log(chalk.gray('   • Central repository for team collaboration'));
      console.log(chalk.gray('   • Git hooks and automation'));
    }
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Repository initialization failed!'));
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.message.includes('permission')) {
      console.log(chalk.yellow('💡 Check directory permissions'));
    }
    
    process.exit(1);
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error.message);
    process.exit(1);
  });
}
