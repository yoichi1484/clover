// src/server/routes/sources.ts

import { Router } from 'express'
import { readFile, writeFile } from 'fs/promises'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'

export const sourcesRouter = Router()

const CONFIG_DIR = '.clover'
const SOURCES_FILE = 'sources.json'

interface Source {
  id: string
  path: string
  name: string
  type?: string
  tags?: string[]
  url?: string
  addedAt?: string
  enabled?: boolean
}

async function loadSources(projectPath: string): Promise<{ sources: Source[] }> {
  const sourcesPath = join(projectPath, CONFIG_DIR, SOURCES_FILE)
  try {
    const content = await readFile(sourcesPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return { sources: [] }
  }
}

async function saveSources(projectPath: string, data: { sources: Source[] }): Promise<void> {
  const sourcesPath = join(projectPath, CONFIG_DIR, SOURCES_FILE)
  await writeFile(sourcesPath, JSON.stringify(data, null, 2), 'utf-8')
}

sourcesRouter.get('/', async (req, res) => {
  try {
    const { projectPath } = req.query
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'projectPath is required' })
    }
    const data = await loadSources(projectPath)
    res.json(data.sources)
  } catch {
    res.json([])
  }
})

sourcesRouter.post('/', async (req, res) => {
  try {
    const { projectPath, filePath } = req.body

    const fileName = basename(filePath)

    const newSource = {
      id: randomUUID(),
      path: filePath,
      name: fileName,
      addedAt: new Date().toISOString()
    }

    const data = await loadSources(projectPath)
    data.sources.push(newSource)
    await saveSources(projectPath, data)

    res.json(newSource)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

sourcesRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { projectPath } = req.query

    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'projectPath is required' })
    }

    const data = await loadSources(projectPath)
    data.sources = data.sources.filter((s) => s.id !== id)
    await saveSources(projectPath, data)

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

sourcesRouter.put('/:id/enabled', async (req, res) => {
  try {
    const { id } = req.params
    const { projectPath, enabled } = req.body

    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'projectPath is required' })
    }

    const data = await loadSources(projectPath)
    const source = data.sources.find((s) => s.id === id)
    if (source) {
      source.enabled = enabled
      await saveSources(projectPath, data)
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})
