import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { api } from '../api'

// Example instructions for each skill (rotates every few seconds)
const SKILL_EXAMPLES = [
  'Write a survey paper on coding agents',
  'Deep research on transformers',
  'Fix the compile error',
  'Translate to Japanese',
  'Save my progress with git',
]

interface TerminalPanelProps {
  projectPath: string
  config: {
    agent: string
    template?: string
    title?: string
    mainFile: string
    resourcesDir: string
    enableClaudeSkills?: boolean
  }
  sources?: Array<{ name: string; path: string }>
}

export interface TerminalPanelHandle {
  isRunning: boolean
  sendMessage: (message: string) => void
  startAndSendMessage: (message: string) => Promise<void>
}

// Delay before sending pending message after Claude is ready
const CLAUDE_READY_DELAY_MS = 1000
const MAX_RETRIES = 10
const RETRY_INTERVAL_MS = 5000
const STARTUP_FAILURE_THRESHOLD_MS = 5000
const ERROR_PATTERNS = ['command not found', 'zsh: command not found', 'not found', 'No such file']

export const TerminalPanel = forwardRef<TerminalPanelHandle, TerminalPanelProps>(
  function TerminalPanel({ projectPath, config }, ref) {
  const [isRunning, setIsRunning] = useState(false)
  const [terminalReady, setTerminalReady] = useState(false)
  const [shellReady, setShellReady] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(() => Math.floor(Math.random() * SKILL_EXAMPLES.length))
  const [isFading, setIsFading] = useState(false)

  // Rotate example instructions randomly every 10 seconds with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setIsFading(true)

      // After fade out, change text and fade in
      setTimeout(() => {
        setExampleIndex((prev) => {
          let next
          do {
            next = Math.floor(Math.random() * SKILL_EXAMPLES.length)
          } while (next === prev && SKILL_EXAMPLES.length > 1)
          return next
        })
        setIsFading(false)
      }, 500) // 500ms for fade out
    }, 10000)
    return () => clearInterval(interval)
  }, [])
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const pendingMessageRef = useRef<string | null>(null)
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const claudeReadyRef = useRef(false)
  const hasSpawnedShell = useRef(false)
  const previousProjectPath = useRef<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const startTimeRef = useRef<number>(0)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorDetectedRef = useRef(false)

  // Spawn shell when project opens
  const spawnShell = useCallback(async () => {
    if (hasSpawnedShell.current || !projectPath) return

    hasSpawnedShell.current = true

    try {
      // Create PTY with user's default shell (no command)
      await api.createPty(projectPath)

      // Resize PTY to match terminal dimensions
      if (fitAddonRef.current) {
        const dims = fitAddonRef.current.proposeDimensions()
        if (dims) {
          await api.resizePty(dims.cols, dims.rows)
        }
      }

      // Inject alias if skills enabled
      if (config?.enableClaudeSkills) {
        const skillsPath = await api.getSkillsPath()
        await api.injectPtyAlias(skillsPath)
      }

      // Mark shell as ready after a short delay (for alias injection to complete)
      setTimeout(async () => {
        setShellReady(true)

        // Pre-fill the claude command (without pressing Enter) so user can see it and press Enter to start
        let command: string
        if (config?.claudeCommand) {
          command = config.claudeCommand
        } else if (config?.enableClaudeSkills) {
          const skillsPath = await api.getSkillsPath()
          command = `claude --plugin-dir "${skillsPath}"`
        } else {
          command = 'claude'
        }
        // Write command to terminal without executing (no \r at the end)
        api.writeToPty(command)
      }, 200)
    } catch (error) {
      console.error('[TerminalPanel] Failed to spawn shell:', error)
      hasSpawnedShell.current = false
      if (xtermRef.current) {
        xtermRef.current.write(`\x1b[31m[Error spawning shell: ${error}]\x1b[0m\r\n`)
      }
    }
  }, [projectPath, config?.enableClaudeSkills])

  // Start claude by sending command to existing shell
  const startClaude = useCallback(async () => {
    if (isRunning || !shellReady) return

    setIsRunning(true)
    claudeReadyRef.current = false
    startTimeRef.current = Date.now()

    // Build the full command
    if (config?.claudeCommand) {
      api.writeToPty(config.claudeCommand + '\r')
    } else if (config?.enableClaudeSkills) {
      api.getSkillsPath().then((skillsPath) => {
        const fullCommand = `claude --plugin-dir "${skillsPath}"`
        api.writeToPty(fullCommand + '\r')
      })
    } else {
      api.writeToPty('claude\r')
    }
  }, [isRunning, shellReady, config?.enableClaudeSkills])

  // Reset and respawn shell when project path changes
  useEffect(() => {
    if (previousProjectPath.current && previousProjectPath.current !== projectPath) {
      // Project changed - destroy old PTY and reset state
      console.log('[TerminalPanel] Project changed, restarting PTY')
      api.destroyPty()
      hasSpawnedShell.current = false
      claudeReadyRef.current = false
      errorDetectedRef.current = false
      setIsRunning(false)
      setShellReady(false)
      setRetryCount(0)
      setIsRetrying(false)
      pendingMessageRef.current = null
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current)
        pendingTimeoutRef.current = null
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      // Clear terminal
      if (xtermRef.current) {
        xtermRef.current.clear()
      }
      // Wait a bit before spawning new shell to ensure old PTY is fully destroyed
      setTimeout(() => {
        if (projectPath && terminalReady) {
          spawnShell()
        }
      }, 500)
    }
    previousProjectPath.current = projectPath
  }, [projectPath, terminalReady, spawnShell])

  // Spawn shell when project is opened and terminal is ready
  useEffect(() => {
    if (projectPath && terminalReady && !hasSpawnedShell.current) {
      spawnShell()
    }
  }, [projectPath, terminalReady, spawnShell])


  // Initialize xterm
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    const term = new Terminal({
      theme: {
        background: '#1a1a1a',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        cursorAccent: '#1a1a1a',
        black: '#1a1a1a',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#d4d4d4',
        brightBlack: '#808080',
        brightRed: '#f44747',
        brightGreen: '#6a9955',
        brightYellow: '#dcdcaa',
        brightBlue: '#569cd6',
        brightMagenta: '#c586c0',
        brightCyan: '#4ec9b0',
        brightWhite: '#ffffff',
      },
      fontSize: 13,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
      cursorBlink: true,
      disableStdin: false,  // Enable stdin for interactive mode
      scrollback: 10000,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon
    setTerminalReady(true)

    // Forward user input to PTY
    term.onData((data) => {
      api.writeToPty(data)
    })

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
      const dims = fitAddon.proposeDimensions()
      if (dims) {
        api.resizePty(dims.cols, dims.rows)
      }
    })
    resizeObserver.observe(terminalRef.current)

    return () => {
      resizeObserver.disconnect()
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [])

  // Set up PTY IPC listeners
  useEffect(() => {
    const cleanupData = api.onPtyData((data: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(data)
      }

      // Detect startup errors
      if (!claudeReadyRef.current && !errorDetectedRef.current) {
        for (const pattern of ERROR_PATTERNS) {
          if (data.toLowerCase().includes(pattern.toLowerCase())) {
            console.log('[TerminalPanel] Error detected:', pattern)
            errorDetectedRef.current = true
            break
          }
        }
      }

      // Detect Claude ready state: look for "? for shortcuts" which appears after startup banner
      // This works whether user pressed Start button or manually pressed Enter
      if (!claudeReadyRef.current && data.includes('? for shortcuts')) {
        console.log('[TerminalPanel] Claude ready detected! pendingMessage:', !!pendingMessageRef.current)
        claudeReadyRef.current = true
        setIsRunning(true)  // Ensure isRunning is true even if user started manually
        setRetryCount(0)  // Reset retry count on successful start
        setIsRetrying(false)

        // Send pending message if exists
        if (pendingMessageRef.current) {
          // Clear any existing timeout
          if (pendingTimeoutRef.current) {
            clearTimeout(pendingTimeoutRef.current)
          }

          console.log('[TerminalPanel] Scheduling pending message send in', CLAUDE_READY_DELAY_MS, 'ms')
          // Wait for Claude to be fully ready before sending
          pendingTimeoutRef.current = setTimeout(() => {
            if (pendingMessageRef.current) {
              console.log('[TerminalPanel] Sending pending message now')
              // Send message, then send extra carriage return after a delay
              // Claude Code shows multi-line paste as "[Pasted text #1 +N lines]"
              // and requires Enter to confirm the paste, then another to submit
              const msg = pendingMessageRef.current
              pendingMessageRef.current = null
              api.writeToPty(msg + '\r')
              // Send another Enter after a short delay to confirm and submit
              setTimeout(() => {
                console.log('[TerminalPanel] Sending second Enter to submit')
                api.writeToPty('\r')
              }, 500)
            }
            pendingTimeoutRef.current = null
          }, CLAUDE_READY_DELAY_MS)
        }
      }
    })

    const cleanupExit = api.onPtyExit((code: number) => {
      console.log('[TerminalPanel] PTY exited with code:', code)
      // Shell exited - reset everything
      setIsRunning(false)
      setShellReady(false)
      hasSpawnedShell.current = false
      setIsRetrying(false)
      setRetryCount(0)

      if (xtermRef.current) {
        xtermRef.current.write(`\r\n\x1b[33m[Shell exited with code ${code}]\x1b[0m\r\n`)
      }

      pendingMessageRef.current = null
      claudeReadyRef.current = false
      errorDetectedRef.current = false
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current)
        pendingTimeoutRef.current = null
      }
    })

    return () => {
      cleanupData?.()
      cleanupExit?.()
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [isRunning])

  const sendMessage = useCallback((message: string) => {
    if (!isRunning) {
      console.warn('[TerminalPanel] Cannot send message: Claude not running')
      return
    }
    // Send message to PTY (as if user typed it)
    // Claude Code shows multi-line paste as "[Pasted text #1 +N lines]"
    // and requires Enter to confirm the paste, then another to submit
    api.writeToPty(message + '\r')
    // Send another Enter after a short delay to confirm and submit
    setTimeout(() => {
      api.writeToPty('\r')
    }, 500)
  }, [isRunning])

  const startAndSendMessage = useCallback(async (message: string) => {
    console.log('[TerminalPanel] startAndSendMessage called', { isRunning, messageLength: message.length })
    if (isRunning) {
      // Already running, send directly
      console.log('[TerminalPanel] Already running, sending directly')
      sendMessage(message)
      return
    }

    // Store message to send after startup
    console.log('[TerminalPanel] Storing pending message and starting Claude')
    pendingMessageRef.current = message

    // Start Claude
    await startClaude()
    console.log('[TerminalPanel] startClaude completed')
  }, [isRunning, sendMessage, startClaude])

  useImperativeHandle(ref, () => ({
    isRunning,
    sendMessage,
    startAndSendMessage
  }), [isRunning, sendMessage, startAndSendMessage])

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header with controls */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-700 bg-[#252525]">
        <span className="text-sm text-green-400 italic">
          Try <span className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>"{SKILL_EXAMPLES[exampleIndex]}"</span>
        </span>
      </div>

      {/* Terminal output area */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      />
    </div>
  )
})
