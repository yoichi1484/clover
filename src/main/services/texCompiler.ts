import { ipcMain, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { join, resolve, sep } from 'path'
import { stat, access, constants } from 'fs/promises'
import { readLatexmkrc, getDefaultLatexmkSettings, type LatexmkSettings } from './latexmkConfig'

let compileProcess: ChildProcess | null = null
let currentProjectPath: string | null = null

export interface CompileResult {
  success: boolean
  pdfPath?: string
  error?: string
  log?: string
}

// Security: Validate that path is within the project directory
function isPathWithinProject(targetPath: string): boolean {
  if (!currentProjectPath) return false
  const normalizedProject = resolve(currentProjectPath)
  const normalizedTarget = resolve(targetPath)
  return (
    normalizedTarget.startsWith(normalizedProject + sep) || normalizedTarget === normalizedProject
  )
}

// Security: Validate mainFile path (can include subdirectories)
function isSafeMainFile(mainFile: string): boolean {
  // Allow subdirectories but prevent path traversal
  return (
    !mainFile.includes('..') &&
    !mainFile.startsWith('/') &&
    !mainFile.startsWith('\\') &&
    mainFile.endsWith('.tex')
  )
}

export function setTexCompilerProjectPath(path: string | null): void {
  currentProjectPath = path ? resolve(path) : null
}

// Check if latexmk is available
async function isLatexmkAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('which', ['latexmk'])
    proc.on('close', (code) => resolve(code === 0))
    proc.on('error', () => resolve(false))
  })
}

export function registerTexCompilerHandlers(): void {
  ipcMain.handle(
    'tex:compile',
    async (event, projectPath: string, mainFile: string): Promise<CompileResult> => {
      // Security: Validate project path
      if (!isPathWithinProject(projectPath)) {
        return { success: false, error: 'Security: Project path is outside allowed directory' }
      }

      // Security: Validate mainFile doesn't contain path traversal
      if (!isSafeMainFile(mainFile)) {
        return { success: false, error: 'Security: Invalid filename' }
      }

      const win = BrowserWindow.fromWebContents(event.sender)

      if (compileProcess) {
        compileProcess.kill()
      }

      const normalizedProjectPath = resolve(projectPath)

      // Check if .latexmkrc exists and read settings
      let settings: LatexmkSettings = getDefaultLatexmkSettings()
      const rcSettings = await readLatexmkrc(normalizedProjectPath)
      if (rcSettings) {
        settings = { ...settings, ...rcSettings }
      }

      // Update mainFile from settings if not provided
      const effectiveMainFile = mainFile || settings.mainFile
      const baseName = effectiveMainFile.replace(/\.tex$/, '')

      // Check if latexmk is available
      const useLatexmk = await isLatexmkAvailable()

      // Check if .latexmkrc exists
      let hasLatexmkrc = false
      try {
        await access(join(normalizedProjectPath, '.latexmkrc'), constants.R_OK)
        hasLatexmkrc = true
      } catch {
        hasLatexmkrc = false
      }

      return new Promise((resolvePromise) => {
        let args: string[]
        let command: string

        if (useLatexmk && hasLatexmkrc) {
          // Use latexmk with .latexmkrc configuration
          // Don't pass -pdf flag - let .latexmkrc's $pdf_mode decide (4 = lualatex)
          command = 'latexmk'
          args = ['-interaction=nonstopmode', '-file-line-error', effectiveMainFile]
          win?.webContents.send('tex:output', `Using latexmk with .latexmkrc configuration\n`)
        } else if (useLatexmk) {
          // Use latexmk without .latexmkrc
          command = 'latexmk'
          args = [
            '-pdf',
            '-interaction=nonstopmode',
            '-file-line-error',
            `-pdflatex=pdflatex -interaction=nonstopmode -file-line-error -synctex=1 %O %S`,
            effectiveMainFile
          ]
          win?.webContents.send('tex:output', `Using latexmk (no .latexmkrc found)\n`)
        } else {
          // Fallback to direct pdflatex
          command = 'pdflatex'
          args = [
            '-interaction=nonstopmode',
            '-halt-on-error',
            '-file-line-error',
            `-output-directory=${normalizedProjectPath}`,
            join(normalizedProjectPath, effectiveMainFile)
          ]
          win?.webContents.send('tex:output', `Using pdflatex directly (latexmk not found)\n`)
        }

        // Security: Use resolved paths to prevent injection
        compileProcess = spawn(command, args, {
          cwd: normalizedProjectPath,
          // Security: Minimal environment
          env: {
            PATH: process.env.PATH,
            HOME: process.env.HOME,
            TEXMFHOME: process.env.TEXMFHOME,
            TEXMFVAR: process.env.TEXMFVAR,
            TEXMFCONFIG: process.env.TEXMFCONFIG
          }
        })

        let output = ''
        let stderr = ''

        compileProcess.stdout?.on('data', (data) => {
          const text = data.toString()
          output += text
          win?.webContents.send('tex:output', text)
        })

        compileProcess.stderr?.on('data', (data) => {
          const text = data.toString()
          stderr += text
          win?.webContents.send('tex:output', text)
        })

        compileProcess.on('close', async (code) => {
          compileProcess = null

          const pdfPath = join(normalizedProjectPath, baseName + '.pdf')
          let pdfExists = false
          try {
            await stat(pdfPath)
            pdfExists = true
          } catch {
            pdfExists = false
          }

          // Success if code is 0 OR if PDF exists (latexmk may return non-zero due to warnings)
          if (code === 0 || pdfExists) {
            if (pdfExists) {
              resolvePromise({ success: true, pdfPath, log: output })
            } else {
              resolvePromise({ success: false, error: 'PDF file not generated', log: output })
            }
          } else {
            resolvePromise({
              success: false,
              error: stderr || `Compilation failed with code ${code}`,
              log: output
            })
          }
        })

        compileProcess.on('error', (err) => {
          compileProcess = null
          resolvePromise({ success: false, error: err.message })
        })
      })
    }
  )
}
