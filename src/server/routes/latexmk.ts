// src/server/routes/latexmk.ts

import { Router } from 'express'
import { readFile, writeFile, readdir } from 'fs/promises'
import { join } from 'path'

export const latexmkRouter = Router()

latexmkRouter.get('/', async (req, res) => {
  try {
    const { projectPath } = req.query
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'projectPath is required' })
    }
    const latexmkrcPath = join(projectPath, '.latexmkrc')
    const content = await readFile(latexmkrcPath, 'utf-8')
    // Parse .latexmkrc (simple key=value parsing)
    const settings: Record<string, unknown> = {}
    const lines = content.split('\n')
    for (const line of lines) {
      const match = line.match(/^\$(\w+)\s*=\s*['"]?([^'"]+)['"]?/)
      if (match) {
        settings[match[1]] = match[2]
      }
    }
    res.json(settings)
  } catch {
    res.json(null)
  }
})

latexmkRouter.post('/', async (req, res) => {
  try {
    const { projectPath, settings } = req.body
    const latexmkrcPath = join(projectPath, '.latexmkrc')

    const lines = []
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string') {
        lines.push(`$${key} = '${value}';`)
      } else if (typeof value === 'number') {
        lines.push(`$${key} = ${value};`)
      }
    }

    await writeFile(latexmkrcPath, lines.join('\n') + '\n', 'utf-8')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

latexmkRouter.get('/texfiles', async (req, res) => {
  try {
    const { projectPath } = req.query
    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({ error: 'projectPath is required' })
    }
    const entries = await readdir(projectPath)
    const texFiles = entries.filter(e => e.endsWith('.tex'))
    res.json(texFiles)
  } catch {
    res.json([])
  }
})
