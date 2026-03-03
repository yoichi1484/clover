// src/renderer/src/api/electron.ts

import type { CloverAPI, FileEntry, ProjectConfig, RecentProject, Source, LatexmkSettings } from './types'

declare global {
  interface Window {
    api: {
      selectDirectory: () => Promise<string | null>
      readFile: (path: string) => Promise<string>
      readBinaryFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      listFiles: (path: string) => Promise<FileEntry[]>
      watchDirectory: (path: string) => Promise<void>
      unwatchDirectory: () => Promise<void>
      onFileChange: (callback: (event: string, path: string) => void) => () => void
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
      compileTex: (projectPath: string, mainFile: string) => Promise<{ success: boolean; pdfPath?: string; error?: string; log?: string }>
      onCompileOutput: (callback: (data: string) => void) => () => void
      selectSourceFiles: () => Promise<string[] | null>
      addSource: (projectPath: string, filePath: string) => Promise<void>
      removeSource: (projectPath: string, sourceId: string) => Promise<void>
      listSources: (projectPath: string) => Promise<Source[]>
      readLatexmkrc: (projectPath: string) => Promise<LatexmkSettings | null>
      writeLatexmkrc: (projectPath: string, settings: LatexmkSettings) => Promise<void>
      getTexFiles: (projectPath: string) => Promise<string[]>
      onLatexmkrcChanged: (callback: (settings: LatexmkSettings) => void) => () => void
      getSkillsPath: () => Promise<string>
      gitStatus: (projectPath: string) => Promise<{ isGitRepo: boolean; files: { status: string; path: string }[] }>
      gitLog: (projectPath: string, limit?: number) => Promise<{ hash: string; message: string; date: string }[]>
      gitShow: (projectPath: string, hash: string, filePath: string) => Promise<string>
      isFullScreen: () => Promise<boolean>
      onFullScreenChange: (callback: (isFullScreen: boolean) => void) => () => void
    }
  }
}

export const electronAPI: CloverAPI = {
  // File operations
  selectDirectory: () => window.api.selectDirectory(),
  readFile: (path) => window.api.readFile(path),
  readBinaryFile: (path) => window.api.readBinaryFile(path),
  writeFile: (path, content) => window.api.writeFile(path, content),
  listFiles: (path) => window.api.listFiles(path),

  // File watcher
  watchDirectory: (path) => window.api.watchDirectory(path),
  unwatchDirectory: () => window.api.unwatchDirectory(),
  onFileChange: (callback) => window.api.onFileChange(callback),

  // PTY
  createPty: (cwd) => window.api.createPty(cwd),
  writeToPty: (data) => window.api.writeToPty(data),
  resizePty: (cols, rows) => window.api.resizePty(cols, rows),
  destroyPty: () => window.api.destroyPty(),
  setPtyProjectPath: (path) => window.api.setPtyProjectPath(path),
  injectPtyAlias: (skillsPath) => window.api.injectPtyAlias(skillsPath),
  onPtyData: (callback) => window.api.onPtyData(callback),
  onPtyExit: (callback) => window.api.onPtyExit(callback),

  // Project management
  getRecentProjects: async () => {
    const paths = await window.api.getRecentProjects()
    // Convert string[] to RecentProject[] by loading each config
    const projects: RecentProject[] = []
    for (const path of paths) {
      const config = await window.api.loadProjectConfig(path)
      projects.push({
        path,
        title: config?.title || path.split('/').pop() || path,
        updatedAt: config?.updatedAt || '',
        createdAt: config?.createdAt || ''
      })
    }
    return projects
  },
  addRecentProject: (path) => window.api.addRecentProject(path),
  loadProjectConfig: (path) => window.api.loadProjectConfig(path),
  saveProjectConfig: (path, config) => window.api.saveProjectConfig(path, config),

  // TeX compilation
  compileTex: (projectPath, mainFile) => window.api.compileTex(projectPath, mainFile),
  onCompileOutput: (callback) => window.api.onCompileOutput(callback),

  // Source management
  selectSourceFiles: () => window.api.selectSourceFiles(),
  addSource: (projectPath, filePath) => window.api.addSource(projectPath, filePath),
  removeSource: (projectPath, sourceId) => window.api.removeSource(projectPath, sourceId),
  listSources: (projectPath) => window.api.listSources(projectPath),

  // Latexmk configuration
  readLatexmkrc: (projectPath) => window.api.readLatexmkrc(projectPath),
  writeLatexmkrc: (projectPath, settings) => window.api.writeLatexmkrc(projectPath, settings),
  getTexFiles: (projectPath) => window.api.getTexFiles(projectPath),
  onLatexmkrcChanged: (callback) => window.api.onLatexmkrcChanged(callback),

  // App info
  getSkillsPath: () => window.api.getSkillsPath(),

  // Git
  gitStatus: (projectPath) => window.api.gitStatus(projectPath),
  gitLog: (projectPath, limit) => window.api.gitLog(projectPath, limit),
  gitShow: (projectPath, hash, filePath) => window.api.gitShow(projectPath, hash, filePath),

  // Window state
  isFullScreen: () => window.api.isFullScreen(),
  onFullScreenChange: (callback) => window.api.onFullScreenChange(callback),

  // Environment
  isWeb: () => false
}
