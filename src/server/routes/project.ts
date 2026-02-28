// src/server/routes/project.ts

import { Router } from 'express'
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join } from 'path'
import os from 'os'
import { CONFIG_DIR, CONFIG_FILE, CLAUDE_MD_FILE, CLAUDE_MD_CONTENT } from '../../shared/constants'

export const projectRouter = Router()

// Shared config directory for both Electron and Web versions
const CLOVER_CONFIG_DIR = join(os.homedir(), '.clover')
const RECENT_PROJECTS_FILE = join(CLOVER_CONFIG_DIR, 'projects.json')

async function ensureConfigDir(): Promise<void> {
  try {
    await stat(CLOVER_CONFIG_DIR)
  } catch {
    await mkdir(CLOVER_CONFIG_DIR, { recursive: true })
  }
}

async function getRecentPaths(): Promise<string[]> {
  try {
    const content = await readFile(RECENT_PROJECTS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function saveRecentPaths(paths: string[]): Promise<void> {
  await ensureConfigDir()
  await writeFile(RECENT_PROJECTS_FILE, JSON.stringify(paths, null, 2), 'utf-8')
}

projectRouter.get('/recent', async (req, res) => {
  try {
    const paths = await getRecentPaths()
    const projects = []

    for (const path of paths) {
      try {
        const configPath = join(path, CONFIG_DIR, CONFIG_FILE)
        const content = await readFile(configPath, 'utf-8')
        const config = JSON.parse(content)
        projects.push({
          path,
          title: config.title || path.split('/').pop() || path,
          updatedAt: config.updatedAt || '',
          createdAt: config.createdAt || ''
        })
      } catch {
        // Project config not found, use path as title
        projects.push({
          path,
          title: path.split('/').pop() || path,
          updatedAt: '',
          createdAt: ''
        })
      }
    }

    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

projectRouter.post('/recent', async (req, res) => {
  try {
    const { path } = req.body
    const paths = await getRecentPaths()
    const filtered = paths.filter(p => p !== path)
    await saveRecentPaths([path, ...filtered].slice(0, 10))
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

projectRouter.get('/config', async (req, res) => {
  try {
    const { path } = req.query
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' })
    }
    const configPath = join(path, CONFIG_DIR, CONFIG_FILE)
    const content = await readFile(configPath, 'utf-8')
    res.json(JSON.parse(content))
  } catch {
    res.json(null)
  }
})

projectRouter.post('/config', async (req, res) => {
  try {
    const { path, config } = req.body
    const configDir = join(path, CONFIG_DIR)
    const configPath = join(configDir, CONFIG_FILE)

    try {
      await stat(configDir)
    } catch {
      await mkdir(configDir, { recursive: true })
    }

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')

    // Create CLAUDE.md in project root if it doesn't exist
    const claudeMdPath = join(path, CLAUDE_MD_FILE)
    try {
      await stat(claudeMdPath)
    } catch {
      await writeFile(claudeMdPath, CLAUDE_MD_CONTENT, 'utf-8')
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})
