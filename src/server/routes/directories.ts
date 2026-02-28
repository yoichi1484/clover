// src/server/routes/directories.ts

import { Router } from 'express'
import os from 'os'

export const directoriesRouter = Router()

directoriesRouter.get('/home', (req, res) => {
  res.json({ homePath: os.homedir() })
})
