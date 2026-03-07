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

export interface FeedbackItem {
  id: string
  file: string         // relative path from projectPath
  fromLine: number
  toLine: number
  excerpt: string      // selected text (truncated to 100 chars)
  text: string         // user's instruction
  sent?: boolean       // true after being sent to agent
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
  claudeCommand?: string  // Custom claude startup command (default: claude with skills)
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

export interface GitCommit {
  hash: string
  message: string
  date: string
}

export interface GitFileStatus {
  status: string
  path: string
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

  // Feedback
  listFeedback(projectPath: string): Promise<FeedbackItem[]>
  addFeedback(projectPath: string, item: Omit<FeedbackItem, 'id'>): Promise<FeedbackItem>
  removeFeedback(projectPath: string, id: string): Promise<void>
  updateFeedback(projectPath: string, id: string, patch: Partial<FeedbackItem>): Promise<void>
  clearFeedback(projectPath: string): Promise<void>

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

  // Git
  gitStatus(projectPath: string): Promise<{ isGitRepo: boolean; files: GitFileStatus[] }>
  gitLog(projectPath: string, limit?: number): Promise<GitCommit[]>
  gitShow(projectPath: string, hash: string, filePath: string): Promise<string>

  // Environment
  isWeb(): boolean
}
