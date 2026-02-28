import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  selectDirectory: () => Promise<string | null>
  readFile: (path: string) => Promise<string>
  readBinaryFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  listFiles: (path: string) => Promise<FileEntry[]>

  watchDirectory: (path: string) => Promise<void>
  unwatchDirectory: () => Promise<void>
  onFileChange: (callback: (event: string, path: string) => void) => void

  compileTex: (projectPath: string, mainFile: string) => Promise<{ success: boolean; pdfPath?: string; error?: string }>
  onCompileOutput: (callback: (data: string) => void) => void

  startAgent: (agent: string, cwd: string, systemPrompt: string, userMessage: string) => Promise<void>
  stopAgent: () => Promise<void>
  sendToAgent: (input: string) => Promise<void>
  onAgentOutput: (callback: (data: string) => void) => void
  onAgentExit: (callback: (code: number) => void) => void

  createPty: (cwd: string) => Promise<void>
  writeToPty: (data: string) => Promise<void>
  resizePty: (cols: number, rows: number) => Promise<void>
  destroyPty: () => Promise<void>
  setPtyProjectPath: (path: string | null) => Promise<void>
  injectPtyAlias: (skillsPath: string) => Promise<void>
  onPtyData: (callback: (data: string) => void) => () => void
  onPtyExit: (callback: (code: number) => void) => () => void

  getRecentProjects: () => Promise<string[]>
  addRecentProject: (path: string) => Promise<void>
  loadProjectConfig: (path: string) => Promise<ProjectConfig | null>
  saveProjectConfig: (path: string, config: ProjectConfig) => Promise<void>

  // Latexmk configuration
  readLatexmkrc: (projectPath: string) => Promise<LatexmkSettings>
  writeLatexmkrc: (projectPath: string, settings: LatexmkSettings) => Promise<void>
  getTexFiles: (projectPath: string) => Promise<string[]>
  onLatexmkrcChanged: (callback: (settings: Partial<LatexmkSettings>) => void) => () => void

  // App info
  getSkillsPath: () => Promise<string>
}

interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
}

type TexCompiler = 'pdflatex' | 'xelatex' | 'lualatex' | 'platex' | 'uplatex'
type TexLiveVersion = '2018' | '2019' | '2020' | '2021' | '2022' | '2023' | '2024' | '2025'

interface LatexmkSettings {
  compiler: TexCompiler
  mainFile: string
  texLiveVersion: TexLiveVersion
}

interface ProjectConfig {
  title: string
  template: string
  agent: 'claude' | 'codex'
  texCommand: string
  mainFile: string
  resourcesDir: string
  compiler: TexCompiler
  texLiveVersion: TexLiveVersion
  enableClaudeSkills: boolean
  lastOpenedFile?: string
  createdAt: string
  updatedAt: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
