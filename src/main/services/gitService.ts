import { execFile } from 'child_process'
import { promisify } from 'util'
import { relative } from 'path'
import { ipcMain } from 'electron'

const execFileAsync = promisify(execFile)

export function registerGitHandlers() {
  ipcMain.handle('git:status', async (_event, projectPath: string) => {
    try {
      await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: projectPath })
      const { stdout } = await execFileAsync('git', ['status', '--porcelain'], { cwd: projectPath })
      const files = stdout.trim().split('\n').filter(Boolean).map(line => ({
        status: line.substring(0, 2).trim(),
        path: line.substring(3)
      }))
      return { isGitRepo: true, files }
    } catch {
      return { isGitRepo: false, files: [] }
    }
  })

  ipcMain.handle('git:log', async (_event, projectPath: string, limit: number = 20) => {
    try {
      const { stdout } = await execFileAsync('git', [
        'log', `--max-count=${limit}`, '--format=%H%n%s%n%ai%n---'
      ], { cwd: projectPath })
      return stdout.trim().split('---\n').filter(Boolean).map(block => {
        const [hash, message, date] = block.trim().split('\n')
        return { hash, message, date }
      })
    } catch {
      return []
    }
  })

  ipcMain.handle('git:show', async (_event, projectPath: string, hash: string, filePath: string) => {
    try {
      const relativePath = relative(projectPath, filePath)
      const { stdout } = await execFileAsync('git', ['show', `${hash}:${relativePath}`], { cwd: projectPath })
      return stdout
    } catch {
      return ''
    }
  })
}
