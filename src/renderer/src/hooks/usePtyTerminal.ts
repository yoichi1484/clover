import { useCallback, useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { api } from '../api'

interface UsePtyTerminalOptions {
  terminalRef: React.RefObject<HTMLDivElement>
  onExit?: (code: number) => void
}

interface UsePtyTerminalReturn {
  isRunning: boolean
  createPty: (cwd: string, command: string) => Promise<void>
  destroyPty: () => Promise<void>
  resizePty: () => void
}

export function usePtyTerminal(options: UsePtyTerminalOptions): UsePtyTerminalReturn {
  const { terminalRef, onExit } = options
  const [isRunning, setIsRunning] = useState(false)
  const terminal = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)

  // Initialize terminal when terminalRef is available
  useEffect(() => {
    if (!terminalRef.current || terminal.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4'
      }
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(terminalRef.current)
    fit.fit()

    terminal.current = term
    fitAddon.current = fit

    return () => {
      term.dispose()
      terminal.current = null
      fitAddon.current = null
    }
  }, [terminalRef])

  // Set up IPC listeners for PTY data and exit
  useEffect(() => {
    const cleanupData = api.onPtyData((data: string) => {
      terminal.current?.write(data)
    })

    const cleanupExit = api.onPtyExit((code: number) => {
      setIsRunning(false)
      onExit?.(code)
    })

    return () => {
      cleanupData?.()
      cleanupExit?.()
    }
  }, [onExit])

  // Set up window resize listener for auto-fit
  useEffect(() => {
    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        fitAddon.current.fit()
        const dims = fitAddon.current.proposeDimensions()
        if (dims && isRunning) {
          api.resizePty(dims.cols, dims.rows)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isRunning])

  const createPty = useCallback(async (cwd: string, command: string) => {
    setIsRunning(true)
    try {
      await api.createPty(cwd, command)

      // Resize PTY to match terminal dimensions after creation
      if (fitAddon.current) {
        const dims = fitAddon.current.proposeDimensions()
        if (dims) {
          await api.resizePty(dims.cols, dims.rows)
        }
      }
    } catch (error) {
      setIsRunning(false)
      throw error
    }
  }, [])

  const destroyPty = useCallback(async () => {
    await api.destroyPty()
    setIsRunning(false)
  }, [])

  const resizePty = useCallback(() => {
    if (fitAddon.current && terminal.current) {
      fitAddon.current.fit()
      const dims = fitAddon.current.proposeDimensions()
      if (dims) {
        api.resizePty(dims.cols, dims.rows)
      }
    }
  }, [])

  return {
    isRunning,
    createPty,
    destroyPty,
    resizePty
  }
}
