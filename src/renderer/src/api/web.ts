// src/renderer/src/api/web.ts

import type { CloverAPI, FileEntry, ProjectConfig, RecentProject, Source, LatexmkSettings } from './types'

const API_BASE = ''  // Same origin

// Event emitter for WebSocket events
type EventCallback = (...args: unknown[]) => void
const eventListeners: Map<string, Set<EventCallback>> = new Map()

function emit(event: string, ...args: unknown[]) {
  const listeners = eventListeners.get(event)
  if (listeners) {
    listeners.forEach(cb => cb(...args))
  }
}

function on(event: string, callback: EventCallback): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set())
  }
  eventListeners.get(event)!.add(callback)
  return () => eventListeners.get(event)?.delete(callback)
}

// WebSocket connections
let ptySocket: WebSocket | null = null
let watcherSocket: WebSocket | null = null
let compileSocket: WebSocket | null = null

// Helper to wait for WebSocket to be ready
function waitForSocketReady(socket: WebSocket | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'))
      return
    }
    if (socket.readyState === WebSocket.OPEN) {
      resolve()
      return
    }
    if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      reject(new Error('Socket is closed'))
      return
    }
    // CONNECTING state - wait for open
    const onOpen = () => {
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('error', onError)
      resolve()
    }
    const onError = (e: Event) => {
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('error', onError)
      reject(new Error('Socket connection failed'))
    }
    socket.addEventListener('open', onOpen)
    socket.addEventListener('error', onError)
  })
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Server error' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res.json()
}

// Directory browser state (for selectDirectory)
let directoryBrowserResolve: ((value: string | null) => void) | null = null

export function resolveDirectorySelection(path: string | null) {
  if (directoryBrowserResolve) {
    directoryBrowserResolve(path)
    directoryBrowserResolve = null
  }
}

export function isDirectoryBrowserOpen(): boolean {
  return directoryBrowserResolve !== null
}

export const webAPI: CloverAPI = {
  // File operations
  selectDirectory: () => {
    return new Promise((resolve) => {
      directoryBrowserResolve = resolve
      emit('openDirectoryBrowser')
    })
  },

  readFile: (path) => fetchAPI(`/files/read?path=${encodeURIComponent(path)}`),

  readBinaryFile: (path) => fetchAPI(`/files/read-binary?path=${encodeURIComponent(path)}`),

  writeFile: (path, content) => fetchAPI('/files/write', {
    method: 'POST',
    body: JSON.stringify({ path, content })
  }),

  listFiles: (path) => fetchAPI(`/files/list?path=${encodeURIComponent(path)}`),

  // File watcher
  watchDirectory: async (path) => {
    if (watcherSocket) {
      watcherSocket.close()
    }
    const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/watcher`
    watcherSocket = new WebSocket(wsUrl)
    watcherSocket.onopen = () => {
      watcherSocket?.send(JSON.stringify({ action: 'watch', path }))
    }
    watcherSocket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'change') {
        emit('fileChange', data.event, data.path)
      }
    }
  },

  unwatchDirectory: async () => {
    if (watcherSocket) {
      watcherSocket.close()
      watcherSocket = null
    }
  },

  onFileChange: (callback) => on('fileChange', callback as EventCallback),

  // PTY
  createPty: async (cwd) => {
    if (ptySocket) {
      ptySocket.close()
    }
    const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/pty`
    ptySocket = new WebSocket(wsUrl)
    ptySocket.onopen = () => {
      ptySocket?.send(JSON.stringify({ action: 'create', cwd }))
    }
    ptySocket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'data') {
        emit('ptyData', data.data)
      } else if (data.type === 'exit') {
        emit('ptyExit', data.code)
      }
    }
  },

  writeToPty: async (data) => {
    if (ptySocket) {
      await waitForSocketReady(ptySocket)
      ptySocket.send(JSON.stringify({ action: 'write', data }))
    }
  },

  resizePty: async (cols, rows) => {
    if (ptySocket) {
      await waitForSocketReady(ptySocket)
      ptySocket.send(JSON.stringify({ action: 'resize', cols, rows }))
    }
  },

  destroyPty: async () => {
    if (ptySocket) {
      await waitForSocketReady(ptySocket)
      ptySocket.send(JSON.stringify({ action: 'destroy' }))
      ptySocket.close()
      ptySocket = null
    }
  },

  setPtyProjectPath: async (path) => {
    if (ptySocket) {
      await waitForSocketReady(ptySocket)
      ptySocket.send(JSON.stringify({ action: 'setProjectPath', path }))
    }
  },

  injectPtyAlias: async (skillsPath) => {
    if (ptySocket) {
      await waitForSocketReady(ptySocket)
      ptySocket.send(JSON.stringify({ action: 'injectAlias', skillsPath }))
    }
  },

  onPtyData: (callback) => on('ptyData', callback as EventCallback),
  onPtyExit: (callback) => on('ptyExit', callback as EventCallback),

  // Project management
  getRecentProjects: () => fetchAPI('/project/recent'),
  addRecentProject: (path) => fetchAPI('/project/recent', {
    method: 'POST',
    body: JSON.stringify({ path })
  }),
  loadProjectConfig: (path) => fetchAPI(`/project/config?path=${encodeURIComponent(path)}`),
  saveProjectConfig: (path, config) => fetchAPI('/project/config', {
    method: 'POST',
    body: JSON.stringify({ path, config })
  }),

  // TeX compilation
  compileTex: async (projectPath, mainFile) => {
    console.log('[web.ts] compileTex called:', { projectPath, mainFile })
    return new Promise((resolve) => {
      if (compileSocket) {
        console.log('[web.ts] Closing existing socket')
        compileSocket.close()
      }
      const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/compile`
      console.log('[web.ts] Connecting to:', wsUrl)
      compileSocket = new WebSocket(wsUrl)
      let log = ''

      compileSocket.onopen = () => {
        console.log('[web.ts] WebSocket opened, sending compile request')
        compileSocket?.send(JSON.stringify({ projectPath, mainFile }))
      }
      compileSocket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log('[web.ts] Received message type:', data.type)
        if (data.type === 'output') {
          log += data.data
          emit('compileOutput', data.data)
        } else if (data.type === 'done') {
          // Compilation finished - check exit code
          const pdfFile = mainFile.replace(/\.tex$/, '.pdf')
          const pdfPath = `${projectPath}/${pdfFile}`
          console.log('[web.ts] Compile done, code:', data.code, 'pdfPath:', pdfPath)
          if (data.code === 0) {
            resolve({ success: true, pdfPath, log })
          } else {
            resolve({ success: false, error: 'Compilation failed', log })
          }
        } else if (data.type === 'error') {
          console.log('[web.ts] Compile error:', data.message)
          resolve({ success: false, error: data.message, log })
        }
      }
      compileSocket.onerror = (err) => {
        console.error('[web.ts] WebSocket error:', err)
        resolve({ success: false, error: 'WebSocket connection failed', log })
      }
      compileSocket.onclose = () => {
        console.log('[web.ts] WebSocket closed')
      }
    })
  },

  onCompileOutput: (callback) => on('compileOutput', callback as EventCallback),

  // Source management
  selectSourceFiles: () => {
    // In web mode, use the same directory browser but for files
    return new Promise((resolve) => {
      directoryBrowserResolve = resolve as (value: string | null) => void
      emit('openFileBrowser')
    })
  },

  addSource: (projectPath, filePath) => fetchAPI('/sources', {
    method: 'POST',
    body: JSON.stringify({ projectPath, filePath })
  }),

  removeSource: (projectPath, sourceId) => fetchAPI(`/sources/${sourceId}?projectPath=${encodeURIComponent(projectPath)}`, {
    method: 'DELETE'
  }),

  listSources: (projectPath) => fetchAPI(`/sources?projectPath=${encodeURIComponent(projectPath)}`),

  setSourceEnabled: (projectPath, sourceId, enabled) => fetchAPI(`/sources/${sourceId}/enabled`, {
    method: 'PUT',
    body: JSON.stringify({ projectPath, enabled })
  }),

  // Latexmk configuration
  readLatexmkrc: (projectPath) => fetchAPI(`/latexmkrc?projectPath=${encodeURIComponent(projectPath)}`),

  writeLatexmkrc: (projectPath, settings) => fetchAPI('/latexmkrc', {
    method: 'POST',
    body: JSON.stringify({ projectPath, settings })
  }),

  getTexFiles: (projectPath) => fetchAPI(`/latexmkrc/texfiles?projectPath=${encodeURIComponent(projectPath)}`),

  onLatexmkrcChanged: (callback) => on('latexmkrcChanged', callback as EventCallback),

  // App info
  getSkillsPath: () => fetchAPI('/app/skills-path'),

  // Window state (Web is always "fullscreen" - no traffic lights)
  isFullScreen: () => Promise.resolve(true),
  onFullScreenChange: () => () => {},

  // Environment
  isWeb: () => true
}

// Export event emitter for DirectoryBrowser component
export { on as onWebEvent, emit as emitWebEvent }
