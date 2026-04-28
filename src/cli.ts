#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { start } from './commands/start.js';

const program = new Command();

program
  .name('agent-memory')
  .description('Local-first project memory for AI agents. Git-aware, MCP-native.')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize agent memory in the current project')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(init);

program
  .command('start')
  .description('Start the MCP server for agent memory')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .option('--port <port>', 'MCP server port', '3100')
  .action(start);

program.parse();
