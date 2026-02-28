// src/server/routes/files.ts

import { Router } from 'express'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { join } from 'path'
import { isPathAllowed } from '../middleware/pathGuard'

export const filesRouter = Router()

filesRouter.get('/read', async (req, res) => {
  try {
    const { path } = req.query
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' })
    }
    const content = await readFile(path, 'utf-8')
    res.json(content)
  } catch (err) {
    res.status(404).json({ error: 'File not found', message: (err as Error).message })
  }
})

filesRouter.get('/read-binary', async (req, res) => {
  try {
    const { path } = req.query
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' })
    }
    const buffer = await readFile(path)
    res.json(buffer.toString('base64'))
  } catch (err) {
    res.status(404).json({ error: 'File not found', message: (err as Error).message })
  }
})

filesRouter.post('/write', async (req, res) => {
  try {
    const { path, content } = req.body
    if (!path || typeof content !== 'string') {
      return res.status(400).json({ error: 'Path and content are required' })
    }
    if (!isPathAllowed(path)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    await writeFile(path, content, 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Write failed', message: (err as Error).message })
  }
})

filesRouter.get('/list', async (req, res) => {
  try {
    const { path } = req.query
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' })
    }
    const entries = await readdir(path, { withFileTypes: true })
    const files = entries
      .filter(entry => !entry.name.startsWith('.') || entry.name === '.clover')
      .map(entry => ({
        name: entry.name,
        path: join(path, entry.name),
        isDirectory: entry.isDirectory()
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    res.json(files)
  } catch (err) {
    res.status(404).json({ error: 'Directory not found', message: (err as Error).message })
  }
})
