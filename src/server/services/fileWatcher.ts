// src/server/services/fileWatcher.ts

import { WebSocket } from 'ws'
import chokidar from 'chokidar'
import os from 'os'
import { resolve } from 'path'

function isPathWithinHome(targetPath: string): boolean {
  const homedir = os.homedir()
  const normalized = resolve(targetPath)
  return normalized.startsWith(homedir)
}

export function setupWatcherWebSocket(ws: WebSocket) {
  let watcher: chokidar.FSWatcher | null = null

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString())

      if (data.action === 'watch') {
        const { path } = data

        if (!isPathWithinHome(path)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Watch path must be within home directory'
          }))
          return
        }

        if (watcher) {
          await watcher.close()
        }

        watcher = chokidar.watch(path, {
          ignored: (filePath: string) => {
            // Always watch .clover directory
            if (filePath.includes('.clover')) return false
            // Ignore other hidden files/directories
            const basename = filePath.split('/').pop() || ''
            return basename.startsWith('.') && basename !== '.clover'
          },
          persistent: true,
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
          }
        })

        watcher.on('all', (event, filePath) => {
          ws.send(JSON.stringify({ type: 'change', event, path: filePath }))
        })

        ws.send(JSON.stringify({ type: 'watching', path }))
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: (err as Error).message }))
    }
  })

  ws.on('close', async () => {
    if (watcher) {
      await watcher.close()
      watcher = null
    }
  })
}
