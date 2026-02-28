// src/server/routes/app.ts

import { Router } from 'express'
import { join } from 'path'

export const appRouter = Router()

appRouter.get('/skills-path', (req, res) => {
  // In server mode, __dirname is dist/server/routes
  // Project root is 3 levels up: dist/server/routes -> dist/server -> dist -> project root
  const skillsPath = join(__dirname, '../../../clover-skills')
  res.json(skillsPath)
})
