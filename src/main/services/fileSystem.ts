import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises'
import { join, resolve, sep, basename } from 'path'
import chokidar from 'chokidar'
import { setPtyProjectPath } from './ptyManager'
import { setTexCompilerProjectPath } from './texCompiler'
import { parseLatexmkrc, notifyLatexmkrcChange } from './latexmkConfig'

let watcher: chokidar.FSWatcher | null = null
let currentProjectPath: string | null = null

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
}

// Security: Validate that target path is within the project directory
function isPathWithinProject(targetPath: string): boolean {
  // If no project path is set yet, allow the operation (initial project open)
  if (!currentProjectPath) return true
  const normalizedProject = resolve(currentProjectPath)
  const normalizedTarget = resolve(targetPath)
  return normalizedTarget.startsWith(normalizedProject + sep) || normalizedTarget === normalizedProject
}

// Security: Validate path and throw if invalid
function validatePath(targetPath: string, operation: string): void {
  if (!isPathWithinProject(targetPath)) {
    throw new Error(`Security: ${operation} outside project directory is not allowed: ${targetPath}`)
  }
}

export function setCurrentProjectPath(path: string | null): void {
  currentProjectPath = path
}

export function registerFileSystemHandlers(): void {
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('fs:readFile', async (_, path: string) => {
    validatePath(path, 'Read')
    return await readFile(path, 'utf-8')
  })

  ipcMain.handle('fs:writeFile', async (_, path: string, content: string) => {
    validatePath(path, 'Write')
    await writeFile(path, content, 'utf-8')
  })

  ipcMain.handle('fs:readBinaryFile', async (_, path: string) => {
    validatePath(path, 'Read')
    const buffer = await readFile(path)
    // Return as base64 string to avoid IPC serialization issues with ArrayBuffer
    return buffer.toString('base64')
  })

  ipcMain.handle('fs:listFiles', async (_, dirPath: string): Promise<FileEntry[]> => {
    validatePath(dirPath, 'List')
    const entries = await readdir(dirPath, { withFileTypes: true })
    return entries
      .filter(entry => !entry.name.startsWith('.') || entry.name === '.clover')
      .map(entry => ({
        name: entry.name,
        path: join(dirPath, entry.name),
        isDirectory: entry.isDirectory()
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  })

  ipcMain.handle('watcher:start', async (event, path: string) => {
    // Set project path when watcher starts (this is the project root)
    currentProjectPath = resolve(path)
    // Share project path with other services for security validation
    setPtyProjectPath(currentProjectPath)
    setTexCompilerProjectPath(currentProjectPath)

    if (watcher) {
      await watcher.close()
    }

    watcher = chokidar.watch(path, {
      ignored: (filePath: string) => {
        // Always watch .clover directory
        if (filePath.includes('.clover')) return false
        // Ignore other hidden files/directories
        const base = basename(filePath)
        return base.startsWith('.') && base !== '.clover'
      },
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    })

    const win = BrowserWindow.fromWebContents(event.sender)

    watcher.on('all', async (eventName, filePath) => {
      win?.webContents.send('watcher:change', eventName, filePath)

      // Detect .latexmkrc changes and notify renderer
      if (basename(filePath) === '.latexmkrc' && (eventName === 'change' || eventName === 'add')) {
        try {
          const settings = await parseLatexmkrc(await readFile(filePath, 'utf-8'))
          if (settings) {
            notifyLatexmkrcChange(settings)
          }
        } catch (err) {
          console.error('Failed to parse .latexmkrc:', err)
        }
      }
    })
  })

  ipcMain.handle('watcher:stop', async () => {
    if (watcher) {
      await watcher.close()
      watcher = null
    }
    currentProjectPath = null
    // Clear project path in other services
    setPtyProjectPath(null)
    setTexCompilerProjectPath(null)
  })
}

export async function ensureDirectory(path: string): Promise<void> {
  try {
    await stat(path)
  } catch {
    await mkdir(path, { recursive: true })
  }
}
