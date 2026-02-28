import { useState, useRef, useEffect } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { useChatStore } from '../store'
import { api } from '../api'

interface ChatPanelProps {
  onStartAgent: (instruction: string) => void
  onStopAgent: () => void
}

export function ChatPanel({ onStartAgent, onStopAgent }: ChatPanelProps): JSX.Element {
  const [input, setInput] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const { messages, isAgentRunning, addMessage } = useChatStore()
  const lastMessageCountRef = useRef(0)

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
      cursorBlink: false,
      disableStdin: true,
      scrollback: 10000,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
    })
    resizeObserver.observe(terminalRef.current)

    return () => {
      resizeObserver.disconnect()
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [])

  // Write new messages to terminal
  useEffect(() => {
    if (!xtermRef.current) return

    const term = xtermRef.current
    const newMessages = messages.slice(lastMessageCountRef.current)

    for (const msg of newMessages) {
      if (msg.role === 'user') {
        term.write(`\x1b[32m> ${msg.content}\x1b[0m\r\n`)
      } else if (msg.role === 'system') {
        term.write(`\x1b[33m[${msg.content}]\x1b[0m\r\n`)
      } else {
        // Agent output - write as-is (includes ANSI codes)
        term.write(msg.content)
      }
    }

    lastMessageCountRef.current = messages.length
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const message = input.trim()
    addMessage({ role: 'user', content: message })
    setInput('')

    if (isAgentRunning) {
      // Agent already running - send message to it
      try {
        await api.sendToAgent(message)
      } catch (err) {
        console.error('Failed to send message to agent:', err)
        addMessage({ role: 'system', content: 'Failed to send message' })
      }
    } else {
      // No agent running - start one with this instruction
      onStartAgent(message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Terminal output area */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      />

      {/* Input area */}
      <div className="border-t border-gray-700 p-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <span className="text-green-400 font-mono py-1.5">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAgentRunning ? '' : 'Enter instruction to start agent...'}
            className="flex-1 px-2 py-1.5 bg-transparent border-none text-sm font-mono text-gray-200 focus:outline-none"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace' }}
          />
          {isAgentRunning ? (
            <button
              onClick={onStopAgent}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded text-sm font-mono"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-mono"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
