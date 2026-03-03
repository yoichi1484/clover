// src/server/index.ts

import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { join } from 'path'
import os from 'os'
import { exec } from 'child_process'

import { filesRouter } from './routes/files'
import { projectRouter } from './routes/project'
import { texRouter } from './routes/tex'
import { sourcesRouter } from './routes/sources'
import { latexmkRouter } from './routes/latexmk'
import { appRouter } from './routes/app'
import { directoriesRouter } from './routes/directories'
import gitRouter from './routes/git'
import { setupPtyWebSocket } from './services/ptyManager'
import { setupWatcherWebSocket } from './services/fileWatcher'
import { setupCompileWebSocket } from './services/compileStream'
import { pathGuard } from './middleware/pathGuard'

const app = express()

// Parse command line arguments
const args = process.argv.slice(2)
const portIndex = args.indexOf('--port')
const DEFAULT_PORT = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : 8080
const MAX_PORT_ATTEMPTS = 10

// Middleware
app.use(express.json())
app.use(pathGuard)

// API Routes
app.use('/api/files', filesRouter)
app.use('/api/project', projectRouter)
app.use('/api/tex', texRouter)
app.use('/api/sources', sourcesRouter)
app.use('/api/latexmk', latexmkRouter)
app.use('/api/app', appRouter)
app.use('/api/directories', directoriesRouter)
app.use('/api/git', gitRouter)

// Serve static files (built frontend)
const staticPath = join(__dirname, '../../renderer')
app.use(express.static(staticPath))

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    res.sendFile(join(staticPath, 'index.html'))
  }
})

// Open browser helper
function openBrowser(url: string) {
  const platform = process.platform
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open'
  exec(`${cmd} ${url}`)
}

// Parse --no-open flag
const noOpen = args.includes('--no-open')

// Setup WebSocket handlers
function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req) => {
    const url = req.url || ''

    if (url.startsWith('/ws/pty')) {
      setupPtyWebSocket(ws)
    } else if (url.startsWith('/ws/watcher')) {
      setupWatcherWebSocket(ws)
    } else if (url.startsWith('/ws/compile')) {
      setupCompileWebSocket(ws)
    } else {
      ws.close()
    }
  })
}

// Try to start server on available port
function startServer(port: number, attempt: number = 0) {
  const httpServer = createServer(app)

  httpServer.once('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      console.log(`Port ${port} in use, trying ${port + 1}...`)
      startServer(port + 1, attempt + 1)
    } else {
      console.error(`Failed to start server: ${err.message}`)
      process.exit(1)
    }
  })

  httpServer.listen(port, () => {
    // Setup WebSocket only after successful listen
    const wss = new WebSocketServer({ server: httpServer })
    setupWebSocket(wss)

    const url = `http://localhost:${port}`
    console.log(`Clover server running at ${url}`)
    console.log(`Home directory: ${os.homedir()}`)
    console.log('Press Ctrl+C to stop')

    if (!noOpen) {
      openBrowser(url)
    }
  })
}

startServer(DEFAULT_PORT)
