import { ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const CONFIG_DIR = '.clover'
const FEEDBACK_FILE = 'feedback.json'

interface FeedbackItem {
  id: string
  file: string
  fromLine: number
  toLine: number
  excerpt: string
  text: string
  sent?: boolean
}

async function load(projectPath: string): Promise<FeedbackItem[]> {
  try {
    const content = await readFile(join(projectPath, CONFIG_DIR, FEEDBACK_FILE), 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function save(projectPath: string, items: FeedbackItem[]): Promise<void> {
  await writeFile(join(projectPath, CONFIG_DIR, FEEDBACK_FILE), JSON.stringify(items, null, 2), 'utf-8')
}

export function registerFeedbackHandlers(): void {
  ipcMain.handle('feedback:list', async (_, projectPath: string) => load(projectPath))

  ipcMain.handle('feedback:add', async (_, projectPath: string, item: Omit<FeedbackItem, 'id'>) => {
    const items = await load(projectPath)
    const newItem: FeedbackItem = { ...item, id: randomUUID() }
    items.push(newItem)
    await save(projectPath, items)
    return newItem
  })

  ipcMain.handle('feedback:remove', async (_, projectPath: string, id: string) => {
    const items = await load(projectPath)
    await save(projectPath, items.filter(i => i.id !== id))
  })

  ipcMain.handle('feedback:update', async (_, projectPath: string, id: string, patch: Partial<FeedbackItem>) => {
    const items = await load(projectPath)
    await save(projectPath, items.map(i => i.id === id ? { ...i, ...patch } : i))
  })

  ipcMain.handle('feedback:clear', async (_, projectPath: string) => {
    await save(projectPath, [])
  })
}
