import { ipcMain } from 'electron'
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join } from 'path'
import os from 'os'
import { CONFIG_DIR, CONFIG_FILE, CLAUDE_MD_FILE, CLAUDE_MD_CONTENT } from '../../shared/constants'

export interface Source {
  id: string
  path: string
  name: string
  addedAt: string
}

// Shared config directory for both Electron and Web versions
const CLOVER_CONFIG_DIR = join(os.homedir(), '.clover')
const RECENT_PROJECTS_FILE = join(CLOVER_CONFIG_DIR, 'projects.json')

async function getRecentPaths(): Promise<string[]> {
  try {
    const content = await readFile(RECENT_PROJECTS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function ensureConfigDir(): Promise<void> {
  try {
    await stat(CLOVER_CONFIG_DIR)
  } catch {
    await mkdir(CLOVER_CONFIG_DIR, { recursive: true })
  }
}

async function saveRecentPaths(paths: string[]): Promise<void> {
  await ensureConfigDir()
  await writeFile(RECENT_PROJECTS_FILE, JSON.stringify(paths, null, 2), 'utf-8')
}

export type TexCompiler = 'pdflatex' | 'xelatex' | 'lualatex' | 'platex' | 'uplatex'
export type TexLiveVersion = '2018' | '2019' | '2020' | '2021' | '2022' | '2023' | '2024' | '2025'

export interface ProjectConfig {
  title: string
  template: string
  agent: 'claude' | 'codex'
  texCommand: string
  mainFile: string
  resourcesDir: string
  sources: Source[]
  // New settings
  compiler: TexCompiler
  texLiveVersion: TexLiveVersion
  enableClaudeSkills: boolean
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface WorkflowState {
  phase: 'initial' | 'outlining' | 'section_writing' | 'reviewing'
  outline: Array<{
    id: string
    title: string
    status: 'pending' | 'in_progress' | 'completed'
  }>
  currentSection: string | null
}

const WORKFLOW_FILE = 'workflow.json'

export function registerProjectManagerHandlers(): void {
  ipcMain.handle('project:getRecent', async (): Promise<string[]> => {
    return getRecentPaths()
  })

  ipcMain.handle('project:addRecent', async (_, path: string) => {
    const recent = await getRecentPaths()
    const filtered = recent.filter(p => p !== path)
    await saveRecentPaths([path, ...filtered].slice(0, 10))
  })

  ipcMain.handle('project:loadConfig', async (_, projectPath: string): Promise<ProjectConfig | null> => {
    const configPath = join(projectPath, CONFIG_DIR, CONFIG_FILE)
    try {
      const content = await readFile(configPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  })

  ipcMain.handle('project:saveConfig', async (_, projectPath: string, config: ProjectConfig) => {
    const configDir = join(projectPath, CONFIG_DIR)
    const configPath = join(configDir, CONFIG_FILE)

    try {
      await stat(configDir)
    } catch {
      await mkdir(configDir, { recursive: true })
    }

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')

    // Create CLAUDE.md in project root if it doesn't exist
    const claudeMdPath = join(projectPath, CLAUDE_MD_FILE)
    try {
      await stat(claudeMdPath)
    } catch {
      await writeFile(claudeMdPath, CLAUDE_MD_CONTENT, 'utf-8')
    }
  })

  ipcMain.handle('project:loadWorkflow', async (_, projectPath: string): Promise<WorkflowState | null> => {
    const workflowPath = join(projectPath, CONFIG_DIR, WORKFLOW_FILE)
    try {
      const content = await readFile(workflowPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  })

  ipcMain.handle('project:saveWorkflow', async (_, projectPath: string, workflow: WorkflowState) => {
    const configDir = join(projectPath, CONFIG_DIR)
    const workflowPath = join(configDir, WORKFLOW_FILE)

    try {
      await stat(configDir)
    } catch {
      await mkdir(configDir, { recursive: true })
    }

    await writeFile(workflowPath, JSON.stringify(workflow, null, 2), 'utf-8')
  })
}

export function createDefaultConfig(): ProjectConfig {
  const now = new Date().toISOString()
  return {
    title: '',
    template: '',
    agent: 'claude',
    texCommand: 'pdflatex',
    mainFile: 'main.tex',
    resourcesDir: 'resources',
    sources: [],
    compiler: 'pdflatex',
    texLiveVersion: '2025',
    enableClaudeSkills: true,
    createdAt: now,
    updatedAt: now
  }
}

export function createDefaultWorkflow(): WorkflowState {
  return {
    phase: 'initial',
    outline: [],
    currentSection: null
  }
}
