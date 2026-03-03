import { useState, useEffect } from 'react'
import { useProjectStore } from '../store/projectStore'
import { useEditorStore } from '../store/editorStore'
import type { TexCompiler, TexLiveVersion } from '../store/projectStore'
import { THEMES, type EditorTheme } from '../themes/latexThemes'
import { api } from '../api'

interface LatexmkSettings {
  compiler: TexCompiler
  mainFile: string
  texLiveVersion: TexLiveVersion
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const COMPILERS: { value: TexCompiler; label: string }[] = [
  { value: 'pdflatex', label: 'pdfLaTeX' },
  { value: 'xelatex', label: 'XeLaTeX' },
  { value: 'lualatex', label: 'LuaLaTeX' },
  { value: 'platex', label: 'pLaTeX' },
  { value: 'uplatex', label: 'upLaTeX' }
]

const TEX_LIVE_VERSIONS: TexLiveVersion[] = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps): JSX.Element | null {
  const { projectPath, config, setConfig } = useProjectStore()
  const { editorTheme, setEditorTheme } = useEditorStore()
  const [settings, setSettings] = useState<LatexmkSettings>({
    compiler: 'pdflatex',
    mainFile: 'main.tex',
    texLiveVersion: '2025'
  })
  const [texFiles, setTexFiles] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [claudeCommand, setClaudeCommand] = useState('')
  const [defaultClaudeCommand, setDefaultClaudeCommand] = useState('claude')

  // Load settings when panel opens
  useEffect(() => {
    if (isOpen && projectPath) {
      loadSettings()
      loadTexFiles()
      // Compute default claude command
      if (config?.enableClaudeSkills) {
        api.getSkillsPath().then((skillsPath) => {
          const defaultCmd = `claude --plugin-dir "${skillsPath}"`
          setDefaultClaudeCommand(defaultCmd)
          setClaudeCommand(config?.claudeCommand || defaultCmd)
        })
      } else {
        setDefaultClaudeCommand('claude')
        setClaudeCommand(config?.claudeCommand || 'claude')
      }
    }
  }, [isOpen, projectPath, config?.enableClaudeSkills])

  // Update local settings state when config changes (from store update)
  useEffect(() => {
    if (config) {
      setSettings((prev) => ({
        ...prev,
        compiler: config.compiler || prev.compiler,
        mainFile: config.mainFile || prev.mainFile,
        texLiveVersion: config.texLiveVersion || prev.texLiveVersion
      }))
    }
  }, [config])

  // Listen for latexmkrc changes from file watcher
  useEffect(() => {
    const unsubscribe = api.onLatexmkrcChanged((newSettings) => {
      setSettings((prev) => ({ ...prev, ...newSettings }))
    })
    return unsubscribe
  }, [])

  // Listen for config.json changes (e.g., when agent modifies it)
  useEffect(() => {
    if (!projectPath) return

    const cleanup = api.onFileChange((_event, path) => {
      if (path.endsWith('config.json') && path.includes('.clover')) {
        // Reload settings from latexmkrc and config
        loadSettings()
      }
    })

    return cleanup
  }, [projectPath])

  async function loadSettings(): Promise<void> {
    if (!projectPath) return
    try {
      const loaded = await api.readLatexmkrc(projectPath)
      setSettings(loaded)
    } catch (error) {
      console.error('Failed to load latexmkrc:', error)
    }
  }

  async function loadTexFiles(): Promise<void> {
    if (!projectPath) return
    try {
      const files = await api.getTexFiles(projectPath)
      setTexFiles(files)
    } catch (error) {
      console.error('Failed to load tex files:', error)
    }
  }

  async function saveSettings(): Promise<void> {
    if (!projectPath) return
    setIsSaving(true)
    try {
      await api.writeLatexmkrc(projectPath, settings)
      // Also update project config
      if (config) {
        const newConfig = {
          ...config,
          compiler: settings.compiler,
          mainFile: settings.mainFile,
          texLiveVersion: settings.texLiveVersion
        }
        setConfig(newConfig)
        await api.saveProjectConfig(projectPath, newConfig)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  function handleChange<K extends keyof LatexmkSettings>(key: K, value: LatexmkSettings[K]): void {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Build Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Main Document */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Main Document
            </label>
            <select
              value={settings.mainFile}
              onChange={(e) => handleChange('mainFile', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {texFiles.length === 0 && (
                <option value={settings.mainFile}>{settings.mainFile}</option>
              )}
              {texFiles.map((file) => (
                <option key={file} value={file}>
                  {file}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              The .tex file that serves as the entry point for compilation
            </p>
          </div>

          {/* Compiler */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Compiler
            </label>
            <select
              value={settings.compiler}
              onChange={(e) => handleChange('compiler', e.target.value as TexCompiler)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {COMPILERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {settings.compiler === 'pdflatex' && 'Standard compiler for most English documents'}
              {settings.compiler === 'xelatex' && 'Supports system fonts and Unicode natively'}
              {settings.compiler === 'lualatex' && 'Modern Lua-based engine with advanced scripting'}
              {settings.compiler === 'platex' && 'Optimized for Japanese typesetting (pTeX)'}
              {settings.compiler === 'uplatex' && 'Unicode-aware Japanese typesetting (upTeX)'}
            </p>
          </div>

          {/* TeX Live Version */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              TeX Live Version
            </label>
            <select
              value={settings.texLiveVersion}
              onChange={(e) => handleChange('texLiveVersion', e.target.value as TexLiveVersion)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {TEX_LIVE_VERSIONS.map((v) => (
                <option key={v} value={v}>
                  TeX Live {v}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Package versions and features depend on the TeX Live release year
            </p>
          </div>

          {/* Enable Claude Skills */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Enable Paper Writing Skills
              </label>
              <p className="text-xs text-gray-500">
                Load Cloverleaf skills plugin when starting Claude
              </p>
            </div>
            <button
              onClick={() => {
                if (config) {
                  const newConfig = { ...config, enableClaudeSkills: !config.enableClaudeSkills }
                  setConfig(newConfig)
                  if (projectPath) {
                    api.saveProjectConfig(projectPath, newConfig)
                  }
                }
              }}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                config?.enableClaudeSkills ? 'bg-indigo-700' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  config?.enableClaudeSkills ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Claude Command */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Claude Command
            </label>
            <input
              type="text"
              value={claudeCommand}
              onChange={(e) => {
                const value = e.target.value
                setClaudeCommand(value)
                if (config) {
                  // Store custom command only if different from default
                  const customCmd = value === defaultClaudeCommand ? undefined : value
                  const newConfig = { ...config, claudeCommand: customCmd }
                  setConfig(newConfig)
                  if (projectPath) {
                    api.saveProjectConfig(projectPath, newConfig)
                  }
                }
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Startup command for Claude Code. Restart terminal to apply changes.
            </p>
          </div>

          {/* Editor Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Editor Theme
            </label>
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Syntax highlighting color scheme for the LaTeX editor
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await saveSettings()
              onClose()
            }}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-indigo-700 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
