import { useState, useCallback, useEffect, useRef } from 'react'
import { Layout } from './components/Layout'
import { Toolbar } from './components/Toolbar'
import { FileTree } from './components/FileTree'
import { LatexEditor } from './components/LatexEditor'
import { PdfViewer } from './components/PdfViewer'
import { TerminalPanel, TerminalPanelHandle } from './components/TerminalPanel'
import { SourcesPanel } from './components/SourcesPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { Source } from './store/projectStore'
import { StartScreen } from './components/StartScreen'
import { DirectoryBrowser } from './components/DirectoryBrowser'
import { useProjectStore, useEditorStore } from './store'
import { useProject } from './hooks/useProject'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { api } from './api'

function App(): JSX.Element {
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [sources, setSources] = useState<Source[]>([])

  const { projectPath, config } = useProjectStore()
  const { currentFile, content, pdfPath, compileError, isCompiling } = useEditorStore()
  const editorStore = useEditorStore()
  const terminalRef = useRef<TerminalPanelHandle>(null)

  // Handler for compile errors - auto-start agent if enabled
  const handleCompileError = useCallback((error: string, log: string) => {
    console.log('[App] handleCompileError called', {
      autoStartAgentOnError: config?.autoStartAgentOnError,
      projectPath,
      terminalRefCurrent: !!terminalRef.current,
      error: error.slice(0, 100)
    })
    if (config?.autoStartAgentOnError && projectPath && terminalRef.current) {
      const errorPrompt = `LaTeX compilation failed. Please analyze the error and fix the relevant file.

Error:
${error}

Compile Log (last 1000 chars):
${log.slice(-1000)}

After fixing, please verify that compilation succeeds.`

      console.log('[App] Calling startAndSendMessage')
      terminalRef.current.startAndSendMessage(errorPrompt)
    }
  }, [config?.autoStartAgentOnError, projectPath])

  const { openProject, createProject, openFile, saveCurrentFile, compile } = useProject({
    onCompileError: handleCompileError
  })

  const handleNewProject = useCallback(async () => {
    const path = await api.selectDirectory()
    if (path) {
      // Use folder name as project title
      const folderName = path.split('/').pop() || 'Untitled'
      await createProject(path, folderName, '', 'claude', 'pdflatex')
    }
  }, [createProject])

  const handleOpenProject = useCallback(async () => {
    const path = await api.selectDirectory()
    if (path) {
      const hasConfig = await openProject(path)
      if (!hasConfig) {
        // Create project with default settings (no dialog)
        await createProject(path, '', '', 'claude', 'pdflatex')
      }
    }
  }, [openProject, createProject])

  const handleOpenRecent = useCallback(async (path: string) => {
    await openProject(path)
  }, [openProject])

  const handleHome = useCallback(() => {
    // Reset project state to show StartScreen
    useProjectStore.getState().reset()
    // Reset editor state
    editorStore.setCurrentFile(null)
    editorStore.setContent('')
    editorStore.setPdfPath(null)
    editorStore.setCompileError(null)
    setSources([])
  }, [editorStore])


  const handleFileSelect = useCallback(async (path: string) => {
    // Allow opening any text-based file in the editor
    const editableExtensions = [
      '.tex', '.bib', '.sty', '.cls',  // LaTeX files
      '.txt', '.md', '.markdown',       // Text/Markdown
      '.json', '.yaml', '.yml',         // Config files
      '.py', '.js', '.ts', '.jsx', '.tsx', // Code files
      '.sh', '.bash', '.zsh',           // Shell scripts
      '.csv', '.tsv',                   // Data files
      '.xml', '.html', '.css',          // Web files
      '.gitignore', '.latexmkrc'        // Dotfiles
    ]
    const fileName = path.split('/').pop() || ''
    const canEdit = editableExtensions.some(ext => path.endsWith(ext)) ||
                   fileName.startsWith('.') // Allow dotfiles
    if (canEdit) {
      await openFile(path)
    }
  }, [openFile])

  const handleEditorChange = useCallback((value: string) => {
    editorStore.setContent(value)
  }, [editorStore])

  useKeyboardShortcuts({
    onSave: saveCurrentFile,
    onCompile: compile,
    onNewProject: handleNewProject,
    onOpenProject: handleOpenProject
  })

  const loadSources = useCallback(async () => {
    if (!projectPath) return
    const loadedSources = await api.listSources(projectPath)
    setSources(loadedSources)
  }, [projectPath])

  const handleAddSources = useCallback(async () => {
    if (!projectPath) return
    const filePaths = await api.selectSourceFiles()
    if (!filePaths) return

    for (const filePath of filePaths) {
      await api.addSource(projectPath, filePath)
    }
    await loadSources()
  }, [projectPath, loadSources])

  const handleRemoveSource = useCallback(async (sourceId: string) => {
    if (!projectPath) return
    await api.removeSource(projectPath, sourceId)
    await loadSources()
  }, [projectPath, loadSources])

  const handleToggleSourceEnabled = useCallback(async (sourceId: string, enabled: boolean) => {
    if (!projectPath) return
    await api.setSourceEnabled(projectPath, sourceId, enabled)
    await loadSources()
  }, [projectPath, loadSources])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  // Watch for sources.json changes to auto-reload sources
  // Use both file watcher events AND polling as fallback
  // (external tools like Claude Code may modify files without triggering watch events)
  useEffect(() => {
    if (!projectPath) return

    // File watcher callback
    const cleanup = api.onFileChange((event, path) => {
      if (path.endsWith('sources.json') && path.includes('.clover')) {
        loadSources()
      }
    })

    // Polling fallback - check every 3 seconds
    const pollInterval = setInterval(() => {
      loadSources()
    }, 3000)

    return () => {
      cleanup?.()
      clearInterval(pollInterval)
    }
  }, [projectPath, loadSources])

  // Show start screen if no project is open
  if (!projectPath) {
    return (
      <>
        <StartScreen
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onOpenRecent={handleOpenRecent}
        />
        {api.isWeb() && <DirectoryBrowser />}
      </>
    )
  }

  return (
    <>
      <Layout
        toolbar={
          <Toolbar
            onNewProject={handleNewProject}
            onOpenProject={handleOpenProject}
            onSettings={() => setShowSettingsPanel(true)}
            onHome={handleHome}
          />
        }
        sources={
          <SourcesPanel
            sources={sources}
            onAddSources={handleAddSources}
            onRemoveSource={handleRemoveSource}
            onToggleSourceEnabled={handleToggleSourceEnabled}
          />
        }
        sidebar={
          <FileTree
            onFileSelect={handleFileSelect}
            selectedPath={currentFile}
          />
        }
        editorHeader={
          <div className="flex items-center justify-between px-3 py-3 border-b border-gray-700 bg-[#252525]">
            <span className="text-sm text-gray-300 truncate">
              {currentFile ? currentFile.split('/').pop() : 'No file selected'}
            </span>
            <div className="flex items-center gap-3">
              {/* Compile status */}
              {isCompiling ? (
                <span className="text-sm text-yellow-400 flex items-center gap-1">
                  <span className="animate-spin">⟳</span> Compiling...
                </span>
              ) : compileError ? (
                <span className="text-sm text-red-400 flex items-center gap-1" title={compileError}>
                  ✗ Error
                </span>
              ) : pdfPath ? (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  ✓ Compiled
                </span>
              ) : null}
              {/* Compile button */}
              <button
                onClick={compile}
                disabled={isCompiling}
                className="px-3 py-1.5 text-sm bg-indigo-700 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded"
                title="Compile (Cmd+B)"
              >
                Compile
              </button>
            </div>
          </div>
        }
        editor={
          currentFile ? (
            <div className="h-full">
              <LatexEditor
                value={content}
                onChange={handleEditorChange}
                onSave={saveCurrentFile}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a file to edit
            </div>
          )
        }
        preview={<PdfViewer pdfPath={pdfPath} />}
        chat={
          config ? (
            <TerminalPanel
              ref={terminalRef}
              projectPath={projectPath}
              config={config}
              sources={sources}
            />
          ) : null
        }
      />
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
      {api.isWeb() && <DirectoryBrowser />}
    </>
  )
}

export default App
