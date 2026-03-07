import { Router } from 'express'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const router = Router()
const CONFIG_DIR = '.clover'
const FEEDBACK_FILE = 'feedback.json'

async function load(projectPath: string) {
  try {
    const content = await readFile(join(projectPath, CONFIG_DIR, FEEDBACK_FILE), 'utf-8')
    return JSON.parse(content)
  } catch { return [] }
}

async function save(projectPath: string, items: object[]) {
  await writeFile(join(projectPath, CONFIG_DIR, FEEDBACK_FILE), JSON.stringify(items, null, 2), 'utf-8')
}

router.get('/', async (req, res) => {
  const projectPath = req.query.projectPath as string
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })
  res.json(await load(projectPath))
})

router.post('/', async (req, res) => {
  const { projectPath, ...item } = req.body
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })
  const items = await load(projectPath)
  const newItem = { ...item, id: randomUUID() }
  items.push(newItem)
  await save(projectPath, items)
  res.json(newItem)
})

router.patch('/:id', async (req, res) => {
  const { projectPath, ...patch } = req.body
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })
  const items = await load(projectPath)
  await save(projectPath, items.map((i: { id: string }) => i.id === req.params.id ? { ...i, ...patch } : i))
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  const projectPath = req.query.projectPath as string
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })
  const items = await load(projectPath)
  await save(projectPath, items.filter((i: { id: string }) => i.id !== req.params.id))
  res.json({ ok: true })
})

router.delete('/', async (req, res) => {
  const projectPath = req.query.projectPath as string
  if (!projectPath) return res.status(400).json({ error: 'projectPath required' })
  await save(projectPath, [])
  res.json({ ok: true })
})

export default router
