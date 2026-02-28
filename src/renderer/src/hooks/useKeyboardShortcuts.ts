import { useEffect } from 'react'

interface ShortcutHandlers {
  onSave: () => void
  onCompile: () => void
  onNewProject: () => void
  onOpenProject: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 's') {
        e.preventDefault()
        handlers.onSave()
      }

      if (isMod && e.key === 'b') {
        e.preventDefault()
        handlers.onCompile()
      }

      if (isMod && e.key === 'n') {
        e.preventDefault()
        handlers.onNewProject()
      }

      if (isMod && e.key === 'o') {
        e.preventDefault()
        handlers.onOpenProject()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
