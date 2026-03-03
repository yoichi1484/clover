import { Router } from 'express'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)
const router = Router()

// Check if project is a git repo + get changed files
router.get('/status', async (req, res) => {
  const projectPath = req.query.projectPath as string
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })

  try {
    await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: projectPath })
    const { stdout } = await execFileAsync('git', ['status', '--porcelain'], { cwd: projectPath })
    const files = stdout.trim().split('\n').filter(Boolean).map(line => ({
      status: line.substring(0, 2).trim(),
      path: line.substring(3)
    }))
    res.json({ isGitRepo: true, files })
  } catch {
    res.json({ isGitRepo: false, files: [] })
  }
})

// Get commit log
router.get('/log', async (req, res) => {
  const projectPath = req.query.projectPath as string
  const limit = parseInt(req.query.limit as string) || 20
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })

  try {
    const { stdout } = await execFileAsync('git', [
      'log', `--max-count=${limit}`, '--format=%H%n%s%n%ai%n---'
    ], { cwd: projectPath })
    const commits = stdout.trim().split('---\n').filter(Boolean).map(block => {
      const [hash, message, date] = block.trim().split('\n')
      return { hash, message, date }
    })
    res.json(commits)
  } catch {
    res.json([])
  }
})

// Get file content at a specific commit
router.get('/show', async (req, res) => {
  const projectPath = req.query.projectPath as string
  const hash = req.query.hash as string
  const filePath = req.query.filePath as string
  if (!projectPath || !hash || !filePath) {
    return res.status(400).json({ error: 'projectPath, hash, filePath required' })
  }

  try {
    const relativePath = path.relative(projectPath, filePath)
    const { stdout } = await execFileAsync('git', ['show', `${hash}:${relativePath}`], { cwd: projectPath })
    res.json({ content: stdout })
  } catch {
    res.json({ content: '' })
  }
})

export default router
