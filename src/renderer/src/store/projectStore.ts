import { create } from 'zustand'

export interface Source {
  id: string
  path?: string
  name?: string
  title?: string  // Alternative to name (for web sources)
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
  // New settings
  compiler: TexCompiler
  texLiveVersion: TexLiveVersion
  enableClaudeSkills: boolean
  lastOpenedFile?: string
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  children?: FileEntry[]
}

interface ProjectState {
  projectPath: string | null
  config: ProjectConfig | null
  files: FileEntry[]
  isLoading: boolean

  setProjectPath: (path: string | null) => void
  setConfig: (config: ProjectConfig | null) => void
  setFiles: (files: FileEntry[]) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectPath: null,
  config: null,
  files: [],
  isLoading: false,

  setProjectPath: (path) => set({ projectPath: path }),
  setConfig: (config) => set({ config }),
  setFiles: (files) => set({ files }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ projectPath: null, config: null, files: [], isLoading: false })
}))
