// src/server/services/compileStream.ts

import { WebSocket } from 'ws'
import { spawn } from 'child_process'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import os from 'os'

function isPathWithinHome(targetPath: string): boolean {
  const homedir = os.homedir()
  const normalized = resolve(targetPath)
  return normalized.startsWith(homedir)
}

export function setupCompileWebSocket(ws: WebSocket) {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      const { projectPath, mainFile } = data

      if (!isPathWithinHome(projectPath)) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Project path must be within home directory'
        }))
        return
      }

      const resolvedPath = resolve(projectPath)
      const pdfFile = mainFile.replace(/\.tex$/, '.pdf')
      const pdfPath = join(resolvedPath, pdfFile)

      // Don't pass -pdf flag - let .latexmkrc's $pdf_mode setting decide the compiler
      // (e.g., $pdf_mode = 4 uses lualatex)
      const proc = spawn('latexmk', ['-interaction=nonstopmode', mainFile], {
        cwd: resolvedPath,
        env: { ...process.env }
      })

      proc.stdout.on('data', (data) => {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }))
      })

      proc.stderr.on('data', (data) => {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }))
      })

      proc.on('close', (code) => {
        // Check if PDF exists - latexmk may return non-zero even when PDF is generated
        // (e.g., due to warnings)
        const pdfExists = existsSync(pdfPath)
        // Success if code is 0 OR if PDF exists (PDF generation is what matters)
        const effectiveCode = (code === 0 || pdfExists) ? 0 : code
        ws.send(JSON.stringify({ type: 'done', code: effectiveCode, pdfExists }))
      })

      proc.on('error', (err) => {
        ws.send(JSON.stringify({ type: 'error', message: err.message }))
      })
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: (err as Error).message }))
    }
  })
}
