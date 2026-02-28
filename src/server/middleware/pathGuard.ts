// src/server/middleware/pathGuard.ts

import { Request, Response, NextFunction } from 'express'
import { resolve } from 'path'
import os from 'os'

const homedir = os.homedir()

export function isPathAllowed(targetPath: string): boolean {
  const resolved = resolve(targetPath)
  return resolved.startsWith(homedir)
}

export function pathGuard(req: Request, res: Response, next: NextFunction) {
  // Extract path from query or body
  const pathParam = req.query.path || req.query.projectPath || req.body?.path || req.body?.projectPath

  if (pathParam && typeof pathParam === 'string') {
    if (!isPathAllowed(pathParam)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Access to paths outside home directory is not allowed'
      })
    }
  }

  next()
}

export { homedir }
