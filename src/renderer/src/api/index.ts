// src/renderer/src/api/index.ts

import type { CloverAPI } from './types'
import { electronAPI } from './electron'
import { webAPI, resolveDirectorySelection, isDirectoryBrowserOpen, onWebEvent, emitWebEvent } from './web'

// Environment detection
const isElectron = typeof window !== 'undefined' && typeof window.api !== 'undefined'

export const api: CloverAPI = isElectron ? electronAPI : webAPI

// Re-export types
export type { CloverAPI, FileEntry, ProjectConfig, RecentProject, Source, LatexmkSettings } from './types'

// Re-export web-specific utilities (only used in web mode)
export { resolveDirectorySelection, isDirectoryBrowserOpen, onWebEvent, emitWebEvent }
