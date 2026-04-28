import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { simpleGit, SimpleGit } from 'simple-git';

interface MemoryIndex {
  version: string;
  projectPath: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  conventions: Array<{ id: string; text: string; file?: string; createdAt: string }>;
  decisions: Array<{ id: string; text: string; file?: string; commit?: string; createdAt: string }>;
  patterns: Array<{ id: string; text: string; file?: string; createdAt: string }>;
}

function loadIndex(projectPath: string): MemoryIndex {
  const indexPath = path.join(projectPath, '.agent-memory', 'index.json');
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }
  return {
    version: '0.1.0',
    projectPath,
    projectName: path.basename(projectPath),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    conventions: [],
    decisions: [],
    patterns: []
  };
}

function saveIndex(projectPath: string, index: MemoryIndex): void {
  index.updatedAt = new Date().toISOString();
  const indexPath = path.join(projectPath, '.agent-memory', 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

async function getRecentCommits(projectPath: string, count = 10): Promise<string[]> {
  try {
    const git: SimpleGit = simpleGit(projectPath);
    const log = await git.log({ maxCount: count });
    return log.all.map(c => `${c.hash.substring(0, 7)} ${c.message}`);
  } catch {
    return [];
  }
}

export async function start(options: { path: string; port?: string }) {
  const projectPath = path.resolve(options.path);
  const memoryDir = path.join(projectPath, '.agent-memory');

  // Ensure memory dir exists
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
    const index: MemoryIndex = {
      version: '0.1.0',
      projectPath,
      projectName: path.basename(projectPath),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conventions: [],
      decisions: [],
      patterns: []
    };
    saveIndex(projectPath, index);
  }

  const server = new Server(
    {
      name: 'agent-memory-layer',
      version: '0.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_memory',
          description: 'Retrieve all project memory — conventions, decisions, and patterns from the agent memory index.',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: { type: 'string', description: 'Path to the project (default: current working dir)' }
            }
          }
        },
        {
          name: 'add_convention',
          description: 'Add a project convention (naming rule, style, architectural pattern) to the memory index.',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: { type: 'string', description: 'Path to the project' },
              convention: { type: 'string', description: 'Convention text to add' },
              file: { type: 'string', description: 'Optional: source file reference' }
            },
            required: ['projectPath', 'convention']
          }
        },
        {
          name: 'add_decision',
          description: 'Record an architectural decision, tool choice, or trade-off in the memory index.',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: { type: 'string', description: 'Path to the project' },
              decision: { type: 'string', description: 'Decision text to record' },
              file: { type: 'string', description: 'Optional: source file reference' },
              commit: { type: 'string', description: 'Optional: commit hash that captures this decision' }
            },
            required: ['projectPath', 'decision']
          }
        },
        {
          name: 'add_pattern',
          description: 'Add a reusable solution template or pattern to the memory index.',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: { type: 'string', description: 'Path to the project' },
              pattern: { type: 'string', description: 'Pattern description' },
              file: { type: 'string', description: 'Optional: source file reference' }
            },
            required: ['projectPath', 'pattern']
          }
        },
        {
          name: 'get_commits',
          description: 'Get recent Git commits for the project (Git-aware memory extraction).',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: { type: 'string', description: 'Path to the project' },
              count: { type: 'number', description: 'Number of recent commits (default: 10)' }
            }
          }
        }
      ] as Tool[]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const projPath = (args?.projectPath as string) || projectPath;

    try {
      if (name === 'get_memory') {
        const index = loadIndex(projPath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(index, null, 2)
            }
          ]
        };
      }

      if (name === 'add_convention') {
        const index = loadIndex(projPath);
        const convention = args?.convention as string;
        index.conventions.push({
          id: `conv-${Date.now()}`,
          text: convention,
          file: args?.file as string,
          createdAt: new Date().toISOString()
        });
        saveIndex(projPath, index);
        return {
          content: [{ type: 'text', text: `Convention added. Total: ${index.conventions.length}` }]
        };
      }

      if (name === 'add_decision') {
        const index = loadIndex(projPath);
        const decision = args?.decision as string;
        index.decisions.push({
          id: `dec-${Date.now()}`,
          text: decision,
          file: args?.file as string,
          commit: args?.commit as string,
          createdAt: new Date().toISOString()
        });
        saveIndex(projPath, index);
        return {
          content: [{ type: 'text', text: `Decision recorded. Total: ${index.decisions.length}` }]
        };
      }

      if (name === 'add_pattern') {
        const index = loadIndex(projPath);
        const pattern = args?.pattern as string;
        index.patterns.push({
          id: `pat-${Date.now()}`,
          text: pattern,
          file: args?.file as string,
          createdAt: new Date().toISOString()
        });
        saveIndex(projPath, index);
        return {
          content: [{ type: 'text', text: `Pattern added. Total: ${index.patterns.length}` }]
        };
      }

      if (name === 'get_commits') {
        const count = (args?.count as number) || 10;
        const commits = await getRecentCommits(projPath, count);
        return {
          content: [{ type: 'text', text: commits.join('\n') || 'No commits found' }]
        };
      }

      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err}` }],
        isError: true
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('agent-memory MCP server running...');
}
