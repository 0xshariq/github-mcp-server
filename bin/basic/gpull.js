#!/usr/bin/env node
import { spawn } from 'child_process';
import chalk from 'chalk';

const args = process.argv.slice(2);

// Handle help command
if (args.includes('--help') || args.includes('-h')) {
  console.log(chalk.magenta.bold('\n🔄 gpull - Fetch and Merge Remote Changes\n'));
  console.log(chalk.cyan('Purpose:'), 'Fetch from remote repository and integrate changes into current branch with comprehensive merge and rebase options.\n');
  
  console.log(chalk.cyan('Command:'), chalk.white('gpull [options] [remote] [branch]\n'));
  
  console.log(chalk.cyan('Parameters:'));
  console.log('  ' + chalk.white('[remote]') + '  - Remote repository name (default: origin)');
  console.log('  ' + chalk.white('[branch]') + '  - Branch name (default: current branch tracking)\n');
  
  console.log(chalk.cyan('Essential Options:'));
  console.log('  ' + chalk.green('--rebase') + '               - Rebase instead of merge');
  console.log('  ' + chalk.green('--ff-only') + '              - Only allow fast-forward merges');
  console.log('  ' + chalk.green('--no-ff') + '                - Create merge commit even for fast-forward');
  console.log('  ' + chalk.green('--squash') + '               - Squash commits into single commit');
  console.log('  ' + chalk.green('-v, --verbose') + '          - Show verbose output');
  console.log('  ' + chalk.green('--dry-run') + '              - Show what would be done without doing it');
  console.log('  ' + chalk.green('--force') + '                - Force pull (use with extreme caution)');
  console.log('  ' + chalk.green('--all') + '                  - Fetch from all configured remotes');
  console.log('  ' + chalk.green('--tags') + '                 - Fetch all tags from remote');
  console.log('  ' + chalk.green('--depth <n>') + '            - Create shallow clone with limited history');
  console.log('  ' + chalk.green('--unshallow') + '            - Convert shallow repository to complete');
  console.log('  ' + chalk.green('-q, --quiet') + '            - Operate quietly, suppress output');
  console.log('  ' + chalk.green('--autostash') + '            - Automatically stash/unstash local changes');
  console.log('  ' + chalk.green('-h, --help') + '             - Show detailed help information\n');
  
  console.log(chalk.cyan('Advanced Options:'));
  console.log('  ' + chalk.green('--strategy=<strategy>') + '   - Merge strategy (ours, theirs, recursive, etc.)');
  console.log('  ' + chalk.green('--strategy-option=<opt>') + ' - Pass option to merge strategy');
  console.log('  ' + chalk.green('--commit, --no-commit') + '   - Control automatic commit creation');
  console.log('  ' + chalk.green('--edit, --no-edit') + '       - Control commit message editing');
  console.log('  ' + chalk.green('--verify-signatures') + '     - Verify commit signatures');
  console.log('  ' + chalk.green('--allow-unrelated-histories') + ' - Allow merging unrelated histories\n');
  
  console.log(chalk.cyan('Common Use Cases:'));
  console.log(chalk.white('  gpull') + '                       # Pull from tracking branch');
  console.log(chalk.white('  gpull --rebase') + '              # Pull with rebase instead of merge');
  console.log(chalk.white('  gpull --ff-only') + '             # Only fast-forward, fail if merge needed');
  console.log(chalk.white('  gpull origin main') + '           # Pull specific branch from origin');
  console.log(chalk.white('  gpull upstream develop') + '      # Pull from upstream remote');
  console.log(chalk.white('  gpull --all') + '                 # Fetch from all remotes');
  console.log(chalk.white('  gpull --dry-run') + '             # Preview what would happen');
  console.log(chalk.white('  gpull --autostash') + '           # Auto-stash uncommitted changes\n');
  
  console.log(chalk.cyan('⚠️  Safety Notes:'));
  console.log('  • Use ' + chalk.yellow('--ff-only') + ' to prevent merge commits');
  console.log('  • Use ' + chalk.yellow('--rebase') + ' to keep linear history');
  console.log('  • ' + chalk.yellow('--force') + ' can overwrite local changes - use carefully');
  console.log('  • Use ' + chalk.yellow('--dry-run') + ' to preview before actual pull');
  console.log('\n' + chalk.gray('═'.repeat(60)));
  process.exit(0);
}

console.log(chalk.cyan.bold('🔄 Git Pull - Fetch and Merge Remote Changes'));
console.log(chalk.gray('━'.repeat(50)));

// Show context information
const contextProcess = spawn('git', ['status', '--porcelain', '-b'], { stdio: 'pipe' });
let contextOutput = '';

contextProcess.stdout.on('data', (data) => {
  contextOutput += data.toString();
});

contextProcess.on('close', (code) => {
  if (code === 0) {
    const lines = contextOutput.trim().split('\n').filter(line => line);
    if (lines.length > 0) {
      const branchLine = lines[0];
      const branchMatch = branchLine.match(/## (.+?)(?:\.\.\.|$)/);
      const currentBranch = branchMatch ? branchMatch[1] : 'unknown';
      
      console.log(chalk.blue('📍 Current Context:'));
      console.log(`   Branch: ${chalk.green(currentBranch)}`);
      
      // Check for uncommitted changes
      const changes = lines.slice(1);
      if (changes.length > 0) {
        console.log(`   ${chalk.yellow('⚠️  Uncommitted changes detected!')}`);
        console.log(`   ${chalk.gray('Consider committing or stashing before pulling')}`);
      }
      
      // Check tracking branch
      if (branchLine.includes('...')) {
        const trackingMatch = branchLine.match(/\.\.\.(.+?)(?:\s|$)/);
        if (trackingMatch) {
          console.log(`   Tracking: ${chalk.cyan(trackingMatch[1])}`);
        }
      }
      console.log('');
    }
  }

  // Execute git pull with provided arguments
  console.log(chalk.blue(`🔍 Running: git pull ${args.join(' ')}`));
  
  const git = spawn('git', ['pull', ...args], { stdio: 'inherit' });

  git.on('close', (code) => {
    console.log(chalk.gray('━'.repeat(50)));
    if (code === 0) {
      console.log(chalk.green('✅ Pull completed successfully!'));
      console.log('');
      console.log(chalk.blue('💡 What\'s Next:'));
      console.log('  gstatus                   # Check current status');
      console.log('  glog -n 5                 # View recent commits');
      console.log('  gdiff                     # Check for conflicts');
      console.log('  gpush                     # Push if you have commits');
    } else {
      console.log(chalk.red('❌ Pull failed!'));
      console.log('');
      console.log(chalk.yellow('🔧 Troubleshooting:'));
      console.log('  gstatus                   # Check repository status');
      console.log('  gdiff                     # Check for conflicts');
      console.log('  gstash                    # Stash uncommitted changes');
      console.log('  glog                      # Review recent history');
      process.exit(1);
    }
  });
});
