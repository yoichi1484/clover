import { ipcMain, BrowserWindow } from 'electron'
import * as pty from 'node-pty'
import { resolve } from 'path'

let ptyProcess: pty.IPty | null = null
let currentProjectPath: string | null = null

// Shell detection based on platform and environment
function getShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'powershell.exe'
  }
  return process.env.SHELL || '/bin/bash'
}

// Shell-specific alias command for injecting --plugin-dir
function getAliasCommand(skillsPath: string, shell: string): string {
  const shellName = shell.toLowerCase()
  if (shellName.includes('powershell') || shellName.includes('pwsh')) {
    // PowerShell function
    return `function claude { & (Get-Command claude -CommandType Application).Source --plugin-dir "${skillsPath}" @args }\r`
  } else if (shellName.includes('cmd')) {
    // cmd.exe doskey macro
    return `doskey claude=claude --plugin-dir "${skillsPath}" $*\r`
  } else {
    // bash/zsh/sh compatible alias
    return `alias claude='claude --plugin-dir "${skillsPath}"'\r`
  }
}

// Shell-specific clear command
function getClearCommand(shell: string): string {
  const shellName = shell.toLowerCase()
  if (shellName.includes('cmd')) {
    return 'cls\r'
  }
  return 'clear\r'
}

export function setPtyProjectPath(path: string | null): void {
  currentProjectPath = path ? resolve(path) : null
}

export function registerPtyManagerHandlers(): void {
  // Create PTY with user's default shell (no command execution)
  ipcMain.handle('pty:create', async (event, cwd: string) => {
    console.log('[PtyManager] Creating PTY with shell:', { cwd })

    const win = BrowserWindow.fromWebContents(event.sender)

    if (ptyProcess) {
      ptyProcess.kill()
      ptyProcess = null
    }

    const shell = getShell()
    console.log('[PtyManager] Using shell:', shell)

    ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: resolve(cwd),
      env: { ...process.env } as { [key: string]: string }
    })

    console.log('[PtyManager] PTY spawned, PID:', ptyProcess.pid)

    ptyProcess.onData((data: string) => {
      win?.webContents.send('pty:data', data)
    })

    ptyProcess.onExit(({ exitCode }) => {
      console.log('[PtyManager] PTY exited:', exitCode)
      win?.webContents.send('pty:exit', exitCode)
      ptyProcess = null
    })
  })

  // Inject claude alias with --plugin-dir
  ipcMain.handle('pty:injectAlias', async (_event, skillsPath: string) => {
    if (!ptyProcess) {
      console.log('[PtyManager] No PTY process for alias injection')
      return
    }

    const shell = getShell()
    const aliasCmd = getAliasCommand(skillsPath, shell)
    console.log('[PtyManager] Injecting alias for shell:', shell)

    ptyProcess.write(aliasCmd)

    // Small delay then clear screen to hide alias command
    setTimeout(() => {
      if (ptyProcess) {
        ptyProcess.write(getClearCommand(shell))
      }
    }, 100)
  })

  ipcMain.handle('pty:write', async (_event, data: string) => {
    if (ptyProcess) {
      ptyProcess.write(data)
    }
  })

  ipcMain.handle('pty:resize', async (_event, cols: number, rows: number) => {
    if (ptyProcess) {
      ptyProcess.resize(cols, rows)
    }
  })

  ipcMain.handle('pty:destroy', async () => {
    if (ptyProcess) {
      ptyProcess.kill()
      ptyProcess = null
    }
  })
}
