#!/usr/bin/env node

/**
 * gremote - Enhanced Git Remote Management
 *
 * This script provides a unified interface for managing Git remotes,
 * including listing, adding, removing, and updating remote URLs.
 *
 * Usage:
 *   gremote                          - List remote repositories
 *   gremote add <name> <url>         - Add a new remote
 *   gremote remove <name>            - Remove a remote
 *   gremote set-url <url> [name]     - Set URL for a remote (default: origin)
 *   gremote -h, --help               - Show this help message
 *
 * Examples:
 *   gremote
 *   gremote add upstream https://github.com/owner/repo.git
 *   gremote remove old-remote
 *   gremote set-url https://new.url/repo.git
 *   gremote set-url https://new.url/repo.git upstream
 */

import { spawn } from 'child_process';
const { showHelp, validateRepository } = require('../advanced/common');

const args = process.argv.slice(2);

function executeGitCommand(gitArgs) {
  return new Promise((resolve, reject) => {
    const gitProcess = spawn('git', gitArgs, { stdio: 'inherit' });
    gitProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Git command failed with code ${code}`));
      }
    });
    gitProcess.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  if (args.includes('-h') || args.includes('--help')) {
    showHelp(
      'gremote',
      'Enhanced Git Remote Management',
      `  gremote                          - List remotes
  gremote add <name> <url>         - Add a new remote
  gremote remove <name>            - Remove a remote
  gremote set-url <url> [name]     - Set URL for a remote (default: origin)
  gremote -h, --help               - Show this help`,
      [
        'gremote',
        'gremote add upstream https://github.com/owner/repo.git',
        'gremote remove old-remote',
        'gremote set-url https://new.url/repo.git',
      ]
    );
    return;
  }

  if (!validateRepository('gremote')) {
    return;
  }

  const [subcommand, ...subcommandArgs] = args;

  try {
    // Trim all arguments for safety
    const trimmedArgs = subcommandArgs.map(a => a.trim());
    switch (subcommand) {
      case 'add': {
        if (trimmedArgs.length !== 2) {
          console.error('❌ Error: `gremote add` requires <name> and <url>.');
          process.exit(1);
        }
        console.log(`➕ Adding remote '${trimmedArgs[0]}' with URL '${trimmedArgs[1]}'`);
        try {
          await executeGitCommand(['remote', 'add', trimmedArgs[0], trimmedArgs[1]]);
          console.log('✅ Remote added successfully.');
          await executeGitCommand(['remote', '-v']);
          process.exit(0);
        } catch (err) {
          console.error(`❌ Git error: ${err.message}`);
          process.exit(1);
        }
        break;
      }
      case 'remove': {
        if (trimmedArgs.length !== 1) {
          console.error('❌ Error: `gremote remove` requires <name>.');
          process.exit(1);
        }
        console.log(`➖ Removing remote '${trimmedArgs[0]}'`);
        try {
          await executeGitCommand(['remote', 'remove', trimmedArgs[0]]);
          console.log('✅ Remote removed successfully.');
          await executeGitCommand(['remote', '-v']);
          process.exit(0);
        } catch (err) {
          console.error(`❌ Git error: ${err.message}`);
          process.exit(1);
        }
        break;
      }
      case 'set-url': {
        if (trimmedArgs.length < 1 || trimmedArgs.length > 2) {
          console.error('❌ Error: `gremote set-url` requires <url> and optionally [name].');
          process.exit(1);
        }
        const [url, name = 'origin'] = trimmedArgs;
        console.log(`✏️ Setting URL for remote '${name}' to '${url}'`);
        try {
          await executeGitCommand(['remote', 'set-url', name, url]);
          console.log('✅ Remote URL updated successfully.');
          await executeGitCommand(['remote', '-v']);
          process.exit(0);
        } catch (err) {
          console.error(`❌ Git error: ${err.message}`);
          process.exit(1);
        }
        break;
      }
      case 'list':
      case undefined: // No subcommand, list remotes
        console.log('🔗 Listing remote repositories:');
        try {
          await executeGitCommand(['remote', '-v']);
          process.exit(0);
        } catch (err) {
          console.error(`❌ Git error: ${err.message}`);
          process.exit(1);
        }
        break;
      default:
        console.error(`❌ Error: Unknown subcommand '${subcommand}'.`);
        console.log('\nUse `gremote --help` for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Operation failed: ${error.message}`);
    process.exit(1);
  }
}

main();


