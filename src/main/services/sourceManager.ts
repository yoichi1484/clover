import { ipcMain, dialog } from 'electron'
import { readFile, writeFile, stat } from 'fs/promises'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'

interface Source {
  id: string
  path: string
  name: string
  type?: string
  tags?: string[]
  url?: string
  addedAt?: string
  enabled?: boolean  // undefined or true = enabled, false = disabled
}

interface SourcesData {
  sources: Source[]
}

const CONFIG_DIR = '.clover'
const SOURCES_FILE = 'sources.json'

async function loadSources(projectPath: string): Promise<SourcesData> {
  const sourcesPath = join(projectPath, CONFIG_DIR, SOURCES_FILE)
  try {
    const content = await readFile(sourcesPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Return empty sources if file doesn't exist
    return { sources: [] }
  }
}

async function saveSources(projectPath: string, data: SourcesData): Promise<void> {
  const sourcesPath = join(projectPath, CONFIG_DIR, SOURCES_FILE)
  await writeFile(sourcesPath, JSON.stringify(data, null, 2), 'utf-8')
}

export function registerSourceManagerHandlers(): void {
  ipcMain.handle('source:selectFiles', async (): Promise<string[] | null> => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
      title: 'Select Source Files or Folders'
    })
    if (result.canceled) return null
    return result.filePaths
  })

  ipcMain.handle('source:add', async (_, projectPath: string, filePath: string): Promise<Source> => {
    // Verify file exists
    await stat(filePath)

    const data = await loadSources(projectPath)

    // Check if already added
    const existing = data.sources.find(s => s.path === filePath)
    if (existing) {
      return existing
    }

    const source: Source = {
      id: randomUUID(),
      path: filePath,
      name: basename(filePath),
      addedAt: new Date().toISOString()
    }

    data.sources.push(source)
    await saveSources(projectPath, data)
    return source
  })

  ipcMain.handle('source:remove', async (_, projectPath: string, sourceId: string): Promise<void> => {
    const data = await loadSources(projectPath)
    data.sources = data.sources.filter(s => s.id !== sourceId)
    await saveSources(projectPath, data)
  })

  ipcMain.handle('source:list', async (_, projectPath: string): Promise<Source[]> => {
    const data = await loadSources(projectPath)
    return data.sources
  })

  ipcMain.handle('source:setEnabled', async (_, projectPath: string, sourceId: string, enabled: boolean): Promise<void> => {
    const data = await loadSources(projectPath)
    const source = data.sources.find(s => s.id === sourceId)
    if (source) {
      source.enabled = enabled
      await saveSources(projectPath, data)
    }
  })
}
