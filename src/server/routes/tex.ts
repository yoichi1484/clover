// src/server/routes/tex.ts

import { Router } from 'express'

export const texRouter = Router()

// TeX compilation is handled via WebSocket for streaming output
// This route is a placeholder for future REST endpoints if needed
texRouter.get('/status', (req, res) => {
  res.json({ status: 'ready' })
})
