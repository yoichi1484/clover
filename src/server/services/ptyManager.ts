// src/server/services/ptyManager.ts

import { WebSocket } from 'ws'
import * as pty from 'node-pty'
import { resolve } from 'path'
import os from 'os'

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

function isPathWithinHome(targetPath: string): boolean {
  const homedir = os.homedir()
  const normalized = resolve(targetPath)
  return normalized.startsWith(homedir)
}

export function setupPtyWebSocket(ws: WebSocket) {
  let ptyProcess: pty.IPty | null = null
  let currentProjectPath: string | null = null

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())

      switch (data.action) {
        case 'create': {
          const { cwd } = data

          if (!isPathWithinHome(cwd)) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Working directory must be within home directory'
            }))
            return
          }

          if (ptyProcess) {
            ptyProcess.kill()
          }

          const shell = getShell()

          ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: resolve(cwd),
            env: { ...process.env } as { [key: string]: string }
          })

          ptyProcess.onData((output) => {
            ws.send(JSON.stringify({ type: 'data', data: output }))
          })

          ptyProcess.onExit(({ exitCode }) => {
            ws.send(JSON.stringify({ type: 'exit', code: exitCode }))
            ptyProcess = null
          })
          break
        }

        case 'injectAlias': {
          if (ptyProcess && data.skillsPath) {
            const shell = getShell()
            const aliasCmd = getAliasCommand(data.skillsPath, shell)
            ptyProcess.write(aliasCmd)

            // Small delay then clear screen
            setTimeout(() => {
              if (ptyProcess) {
                ptyProcess.write(getClearCommand(shell))
              }
            }, 100)
          }
          break
        }

        case 'write':
          if (ptyProcess) {
            ptyProcess.write(data.data)
          }
          break

        case 'resize':
          if (ptyProcess) {
            ptyProcess.resize(data.cols, data.rows)
          }
          break

        case 'setProjectPath':
          currentProjectPath = data.path ? resolve(data.path) : null
          break

        case 'destroy':
          if (ptyProcess) {
            ptyProcess.kill()
            ptyProcess = null
          }
          break
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: (err as Error).message }))
    }
  })

  ws.on('close', () => {
    if (ptyProcess) {
      ptyProcess.kill()
      ptyProcess = null
    }
  })
}
