import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // File operations
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
  readBinaryFile: (path: string) => ipcRenderer.invoke('fs:readBinaryFile', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
  listFiles: (path: string) => ipcRenderer.invoke('fs:listFiles', path),

  // File watcher
  watchDirectory: (path: string) => ipcRenderer.invoke('watcher:start', path),
  unwatchDirectory: () => ipcRenderer.invoke('watcher:stop'),
  onFileChange: (callback: (event: string, path: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, event: string, path: string) => callback(event, path)
    ipcRenderer.on('watcher:change', handler)
    return () => ipcRenderer.removeListener('watcher:change', handler)
  },

  // TeX compilation
  compileTex: (projectPath: string, mainFile: string) =>
    ipcRenderer.invoke('tex:compile', projectPath, mainFile),
  onCompileOutput: (callback: (data: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: string) => callback(data)
    ipcRenderer.on('tex:output', handler)
    return () => ipcRenderer.removeListener('tex:output', handler)
  },

  // PTY management
  createPty: (cwd: string) => ipcRenderer.invoke('pty:create', cwd),
  writeToPty: (data: string) => ipcRenderer.invoke('pty:write', data),
  resizePty: (cols: number, rows: number) => ipcRenderer.invoke('pty:resize', cols, rows),
  destroyPty: () => ipcRenderer.invoke('pty:destroy'),
  setPtyProjectPath: (path: string | null) => ipcRenderer.invoke('pty:setProjectPath', path),
  injectPtyAlias: (skillsPath: string) => ipcRenderer.invoke('pty:injectAlias', skillsPath),
  onPtyData: (callback: (data: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: string) => callback(data)
    ipcRenderer.on('pty:data', handler)
    return () => ipcRenderer.removeListener('pty:data', handler)
  },
  onPtyExit: (callback: (code: number) => void) => {
    const handler = (_: Electron.IpcRendererEvent, code: number) => callback(code)
    ipcRenderer.on('pty:exit', handler)
    return () => ipcRenderer.removeListener('pty:exit', handler)
  },

  // Project management
  getRecentProjects: () => ipcRenderer.invoke('project:getRecent'),
  addRecentProject: (path: string) => ipcRenderer.invoke('project:addRecent', path),
  loadProjectConfig: (path: string) => ipcRenderer.invoke('project:loadConfig', path),
  saveProjectConfig: (path: string, config: object) =>
    ipcRenderer.invoke('project:saveConfig', path, config),

  // Source management
  selectSourceFiles: () => ipcRenderer.invoke('source:selectFiles'),
  addSource: (projectPath: string, filePath: string) =>
    ipcRenderer.invoke('source:add', projectPath, filePath),
  removeSource: (projectPath: string, sourceId: string) =>
    ipcRenderer.invoke('source:remove', projectPath, sourceId),
  listSources: (projectPath: string) =>
    ipcRenderer.invoke('source:list', projectPath),
  setSourceEnabled: (projectPath: string, sourceId: string, enabled: boolean) =>
    ipcRenderer.invoke('source:setEnabled', projectPath, sourceId, enabled),
  listFeedback: (projectPath: string) =>
    ipcRenderer.invoke('feedback:list', projectPath),
  addFeedback: (projectPath: string, item: object) =>
    ipcRenderer.invoke('feedback:add', projectPath, item),
  removeFeedback: (projectPath: string, id: string) =>
    ipcRenderer.invoke('feedback:remove', projectPath, id),
  updateFeedback: (projectPath: string, id: string, patch: object) =>
    ipcRenderer.invoke('feedback:update', projectPath, id, patch),
  clearFeedback: (projectPath: string) =>
    ipcRenderer.invoke('feedback:clear', projectPath),

  // Latexmk configuration
  readLatexmkrc: (projectPath: string) =>
    ipcRenderer.invoke('latexmkrc:read', projectPath),
  writeLatexmkrc: (projectPath: string, settings: object) =>
    ipcRenderer.invoke('latexmkrc:write', projectPath, settings),
  getTexFiles: (projectPath: string) =>
    ipcRenderer.invoke('latexmkrc:getTexFiles', projectPath),
  onLatexmkrcChanged: (callback: (settings: object) => void) => {
    const handler = (_: Electron.IpcRendererEvent, settings: object) => callback(settings)
    ipcRenderer.on('latexmkrc:changed', handler)
    return () => ipcRenderer.removeListener('latexmkrc:changed', handler)
  },

  // App info
  getSkillsPath: () => ipcRenderer.invoke('app:getSkillsPath'),

  // Window state
  isFullScreen: () => ipcRenderer.invoke('window:isFullScreen'),
  onFullScreenChange: (callback: (isFullScreen: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, isFullScreen: boolean) => callback(isFullScreen)
    ipcRenderer.on('window:fullScreenChange', handler)
    return () => ipcRenderer.removeListener('window:fullScreenChange', handler)
  },

  // Git operations
  gitStatus: (projectPath: string) => ipcRenderer.invoke('git:status', projectPath),
  gitLog: (projectPath: string, limit?: number) => ipcRenderer.invoke('git:log', projectPath, limit),
  gitShow: (projectPath: string, hash: string, filePath: string) =>
    ipcRenderer.invoke('git:show', projectPath, hash, filePath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
