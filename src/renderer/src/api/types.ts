// src/renderer/src/api/types.ts

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
}

export interface Source {
  id: string
  path: string
  name: string
  type?: string
  tags?: string[]
  url?: string
  addedAt?: string
  enabled?: boolean  // undefined or true = enabled, false = disabled
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
  compiler: TexCompiler
  texLiveVersion: TexLiveVersion
  enableClaudeSkills: boolean
  autoStartAgent?: boolean  // Auto-start agent when project opens (default: false)
  lastOpenedFile?: string
  createdAt: string
  updatedAt: string
}

export interface LatexmkSettings {
  compiler?: string
  outputDir?: string
  synctex?: boolean
  shell_escape?: boolean
  options?: string[]
}

export interface RecentProject {
  path: string
  title: string
  updatedAt: string
  createdAt: string
}

export interface CloverAPI {
  // File operations
  selectDirectory(): Promise<string | null>
  readFile(path: string): Promise<string>
  readBinaryFile(path: string): Promise<string>  // base64 encoded
  writeFile(path: string, content: string): Promise<void>
  listFiles(path: string): Promise<FileEntry[]>

  // File watcher
  watchDirectory(path: string): Promise<void>
  unwatchDirectory(): Promise<void>
  onFileChange(callback: (event: string, path: string) => void): () => void

  // PTY
  createPty(cwd: string): Promise<void>
  writeToPty(data: string): Promise<void>
  resizePty(cols: number, rows: number): Promise<void>
  destroyPty(): Promise<void>
  setPtyProjectPath(path: string | null): Promise<void>
  injectPtyAlias(skillsPath: string): Promise<void>
  onPtyData(callback: (data: string) => void): () => void
  onPtyExit(callback: (code: number) => void): () => void

  // Project management
  getRecentProjects(): Promise<RecentProject[]>
  addRecentProject(path: string): Promise<void>
  loadProjectConfig(path: string): Promise<ProjectConfig | null>
  saveProjectConfig(path: string, config: ProjectConfig): Promise<void>

  // TeX compilation
  compileTex(projectPath: string, mainFile: string): Promise<{ success: boolean; pdfPath?: string; error?: string; log?: string }>
  onCompileOutput(callback: (data: string) => void): () => void

  // Source management
  selectSourceFiles(): Promise<string[] | null>
  addSource(projectPath: string, filePath: string): Promise<void>
  removeSource(projectPath: string, sourceId: string): Promise<void>
  listSources(projectPath: string): Promise<Source[]>
  setSourceEnabled(projectPath: string, sourceId: string, enabled: boolean): Promise<void>

  // Latexmk configuration
  readLatexmkrc(projectPath: string): Promise<LatexmkSettings | null>
  writeLatexmkrc(projectPath: string, settings: LatexmkSettings): Promise<void>
  getTexFiles(projectPath: string): Promise<string[]>
  onLatexmkrcChanged(callback: (settings: LatexmkSettings) => void): () => void

  // App info
  getSkillsPath(): Promise<string>

  // Window state (Electron only, Web returns defaults)
  isFullScreen(): Promise<boolean>
  onFullScreenChange(callback: (isFullScreen: boolean) => void): () => void

  // Environment
  isWeb(): boolean
}
