import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';

export async function init(options: { path: string }) {
  const projectPath = path.resolve(options.path);
  const memoryDir = path.join(projectPath, '.agent-memory');
  const memoryIndex = path.join(memoryDir, 'index.json');
  const memoryMarkdown = path.join(memoryDir, 'memory.md');
  const gitignoreEntry = '.agent-memory/';

  console.log(chalk.blue(`Initializing agent memory at: ${projectPath}`));

  // Create .agent-memory directory
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
    console.log(chalk.green(`✓ Created ${memoryDir}`));
  } else {
    console.log(chalk.yellow(`! ${memoryDir} already exists`));
  }

  // Create index.json
  if (!fs.existsSync(memoryIndex)) {
    const index = {
      version: '0.1.0',
      projectPath,
      projectName: path.basename(projectPath),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conventions: [],
      decisions: [],
      patterns: [],
      conventionsCount: 0,
      decisionsCount: 0,
      patternsCount: 0
    };
    fs.writeFileSync(memoryIndex, JSON.stringify(index, null, 2));
    console.log(chalk.green(`✓ Created ${memoryIndex}`));
  }

  // Create memory.md
  if (!fs.existsSync(memoryMarkdown)) {
    const now = new Date().toISOString().split('T')[0];
    const content = `# Agent Memory — ${path.basename(projectPath)}

> Auto-generated. Track project conventions, decisions, and patterns here.

## Conventions
<!-- Language styles, naming rules, architectural patterns -->

## Decisions
<!-- Architectural choices, tool selections, trade-offs -->

## Patterns
<!-- Reusable solution templates -->

---
_Auto-updated by agent-memory-layer v0.1.0 on ${now}_
`;
    fs.writeFileSync(memoryMarkdown, content);
    console.log(chalk.green(`✓ Created ${memoryMarkdown}`));
  }

  // Append to .gitignore
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignore.includes(gitignoreEntry)) {
      fs.appendFileSync(gitignorePath, `\n${gitignoreEntry}\n`);
      console.log(chalk.green(`✓ Added to .gitignore`));
    }
  }

  console.log(chalk.green(`\n✅ Agent memory initialized!`));
  console.log(chalk.gray(`  Index: ${memoryIndex}`));
  console.log(chalk.gray(`  Memory: ${memoryMarkdown}`));
  console.log(chalk.gray(`\n  Run 'agent-memory start' to launch the MCP server.`));
}
