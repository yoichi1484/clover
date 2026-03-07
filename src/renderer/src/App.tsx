import { useState, useCallback, useEffect, useRef } from 'react'
import { Layout } from './components/Layout'
import { Toolbar } from './components/Toolbar'
import { FileTree } from './components/FileTree'
import { LatexEditor } from './components/LatexEditor'
import { PdfViewer } from './components/PdfViewer'
import { DiffViewer } from './components/DiffViewer'
import { TerminalPanel, TerminalPanelHandle } from './components/TerminalPanel'
import { SourcesPanel } from './components/SourcesPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { FeedbackPanel, PendingSelection } from './components/FeedbackPanel'
import { FeedbackSelectionPopup } from './components/FeedbackSelectionPopup'
import { FeedbackItem } from './api/types'
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
  const [commits, setCommits] = useState<{ hash: string; message: string; date: string }[]>([])
  const [gitStatuses, setGitStatuses] = useState<Map<string, string>>(new Map())
  const [gitNotInitialized, setGitNotInitialized] = useState(false)
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false)
  const [feedbackPanelHeight, setFeedbackPanelHeight] = useState(384)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectionInfo, setSelectionInfo] = useState<{ fromLine: number; toLine: number; excerpt: string } | null>(null)
  const feedbackResizeRef = useRef<{ startY: number; startHeight: number } | null>(null)

  const { projectPath, config } = useProjectStore()
  const { currentFile, content, pdfPath, compileError, isCompiling, diffMode, diffOriginalContent, selectedCommit } = useEditorStore()
  const editorStore = useEditorStore()
  const terminalRef = useRef<TerminalPanelHandle>(null)

  const { openProject, createProject, openFile, saveCurrentFile, compile } = useProject({})

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

  const handleDiffMode = useCallback(async () => {
    if (!projectPath || !currentFile) return
    const status = await api.gitStatus(projectPath)
    if (!status.isGitRepo) {
      setGitNotInitialized(true)
      editorStore.setDiffMode(true)
      return
    }
    setGitNotInitialized(false)
    const commitList = await api.gitLog(projectPath, 20)
    setCommits(commitList)
    if (commitList.length > 0) {
      const commit = commitList[0]
      const originalContent = await api.gitShow(projectPath, commit.hash, currentFile)
      editorStore.setSelectedCommit(commit)
      editorStore.setDiffOriginalContent(originalContent)
      editorStore.setDiffMode(true)
    }
  }, [projectPath, currentFile, editorStore])

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
    setSources(prev => prev.map(s => s.id === sourceId ? { ...s, enabled } : s))
    await api.setSourceEnabled(projectPath, sourceId, enabled)
  }, [projectPath])

  const handleAddFeedback = useCallback(async (item: Omit<FeedbackItem, 'id'>) => {
    if (!projectPath) return
    const newItem = await api.addFeedback(projectPath, item)
    setFeedbackItems(prev => [...prev, newItem])
  }, [projectPath])

  const handleRemoveFeedback = useCallback(async (id: string) => {
    if (!projectPath) return
    await api.removeFeedback(projectPath, id)
    setFeedbackItems(prev => prev.filter(i => i.id !== id))
  }, [projectPath])

  const handleUpdateFeedback = useCallback(async (id: string, patch: Partial<FeedbackItem>) => {
    if (!projectPath) return
    await api.updateFeedback(projectPath, id, patch)
    setFeedbackItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }, [projectPath])

  const handleApplyFeedback = useCallback(async (items: FeedbackItem[]) => {
    if (items.length === 0) return
    const lines = items.map((item, i) => {
      const range = item.fromLine === item.toLine
        ? `${item.file} line ${item.fromLine}`
        : `${item.file} lines ${item.fromLine}–${item.toLine}`
      return `${i + 1}. ${range} "${item.excerpt}": ${item.text}`
    })
    const prompt = `Please revise the following based on this feedback:\n\n${lines.join('\n')}`
    terminalRef.current?.startAndSendMessage(prompt)
    for (const item of items) {
      await handleUpdateFeedback(item.id, { sent: true })
    }
  }, [handleUpdateFeedback])

  const handleFeedbackResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    feedbackResizeRef.current = { startY: e.clientY, startHeight: feedbackPanelHeight }
    const onMove = (ev: MouseEvent) => {
      if (!feedbackResizeRef.current) return
      const delta = feedbackResizeRef.current.startY - ev.clientY
      const newHeight = Math.max(80, Math.min(600, feedbackResizeRef.current.startHeight + delta))
      setFeedbackPanelHeight(newHeight)
    }
    const onUp = () => {
      feedbackResizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [feedbackPanelHeight])

  const handleEditorFeedbackSelection = useCallback((sel: { fromLine: number; toLine: number; excerpt: string; x: number; y: number } | null) => {
    if (!currentFile || !projectPath) return
    if (sel) {
      setSelectionInfo({ fromLine: sel.fromLine, toLine: sel.toLine, excerpt: sel.excerpt })
      setPopupPosition({ x: sel.x, y: sel.y })
    } else {
      setSelectionInfo(null)
      setPopupPosition(null)
    }
  }, [currentFile, projectPath])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  const loadFeedback = useCallback(async () => {
    if (!projectPath) return
    const items = await api.listFeedback(projectPath)
    setFeedbackItems(items)
  }, [projectPath])

  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  // Poll git status for file tree markers
  useEffect(() => {
    if (!projectPath) return
    const fetchStatus = async () => {
      try {
        const result = await api.gitStatus(projectPath)
        if (result.isGitRepo) {
          const map = new Map<string, string>()
          result.files.forEach(f => map.set(f.path, f.status))
          setGitStatuses(map)
        }
      } catch {
        // ignore errors
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [projectPath])

  // Watch for sources.json changes (e.g. when Claude Code modifies it externally)
  useEffect(() => {
    if (!projectPath) return

    const cleanup = api.onFileChange((event, path) => {
      if (path.endsWith('sources.json') && path.includes('.clover')) {
        loadSources()
      }
    })

    return () => { cleanup?.() }
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
            onFeedback={() => setShowFeedbackPanel(v => !v)}
            feedbackCount={feedbackItems.length}
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
            gitStatuses={gitStatuses}
          />
        }
        editorHeader={
          <div className="border-b border-gray-700 bg-[#252525]">
            {/* Row 1: filename + tabs + status + compile */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300 truncate">
                  {currentFile ? currentFile.split('/').pop() : 'No file selected'}
                </span>
                {currentFile && (
                  <>
                    <button
                      onClick={() => { editorStore.setDiffMode(false); setGitNotInitialized(false) }}
                      className={`px-2 py-0.5 text-xs rounded ${!diffMode ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDiffMode}
                      className={`px-2 py-0.5 text-xs rounded ${diffMode ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Diff
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {gitStatuses.size > 0 && (
                  <span className="text-xs text-yellow-400" title={`${gitStatuses.size} uncommitted change(s)`}>
                    {gitStatuses.size} Uncommitted
                  </span>
                )}
                {isCompiling ? (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <span className="animate-spin">⟳</span> Compiling...
                  </span>
                ) : compileError ? (
                  <span className="text-xs text-red-400 flex items-center gap-1" title={compileError}>
                    ✗ Error
                  </span>
                ) : pdfPath ? (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    ✓ Compiled
                  </span>
                ) : null}
                <button
                  onClick={compile}
                  disabled={isCompiling}
                  className="px-3 py-1 text-xs bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded"
                  title="Compile (Cmd+B)"
                >
                  Compile
                </button>
              </div>
            </div>
            {/* Row 2: commit selector (only in diff mode) */}
            {diffMode && commits.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 border-t border-gray-700">
                <span className="text-xs text-gray-500">Compare with:</span>
                <select
                  value={selectedCommit?.hash || ''}
                  onChange={async (e) => {
                    const hash = e.target.value
                    const commit = commits.find(c => c.hash === hash)
                    if (commit && currentFile) {
                      const original = await api.gitShow(projectPath!, hash, currentFile)
                      editorStore.setSelectedCommit(commit)
                      editorStore.setDiffOriginalContent(original)
                    }
                  }}
                  className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5 flex-1 truncate"
                >
                  {commits.map(c => (
                    <option key={c.hash} value={c.hash}>
                      {c.hash.substring(0, 7)} — {c.message}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
        editor={
          currentFile ? (
            <div className="h-full flex flex-col">
              <div
                className={showFeedbackPanel ? 'flex-1 min-h-0' : 'h-full'}
              >
                {diffMode ? (
                  gitNotInitialized ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <p className="text-sm mb-2">This project is not a git repository.</p>
                        <p className="text-xs text-gray-500">Tell Claude Code: &quot;git init&quot;</p>
                      </div>
                    </div>
                  ) : (
                    <DiffViewer
                      original={diffOriginalContent}
                      modified={content}
                    />
                  )
                ) : (
                  <div className="h-full">
                    <LatexEditor
                      value={content}
                      onChange={handleEditorChange}
                      onSave={saveCurrentFile}
                      onFeedbackSelection={handleEditorFeedbackSelection}
                    />
                  </div>
                )}
              </div>
              {showFeedbackPanel && (
                <div style={{ height: feedbackPanelHeight }} className="flex-shrink-0 flex flex-col">
                  <div
                    className="h-1 cursor-ns-resize bg-transparent hover:bg-blue-500/40 flex-shrink-0"
                    onMouseDown={handleFeedbackResizeStart}
                  />
                  <div className="flex-1 min-h-0">
                  <FeedbackPanel
                    projectPath={projectPath}
                    feedbackItems={feedbackItems}
                    pendingSelection={pendingSelection}
                    onAdd={handleAddFeedback}
                    onRemove={handleRemoveFeedback}
                    onApply={handleApplyFeedback}
                    onUpdate={handleUpdateFeedback}
                    onClearPending={() => setPendingSelection(null)}
                  />
                  </div>
                </div>
              )}
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
      {selectionInfo && popupPosition && (
        <FeedbackSelectionPopup
          visible={true}
          position={popupPosition}
          onClick={() => {
            if (!selectionInfo || !currentFile || !projectPath) return
            setShowFeedbackPanel(true)
            setPendingSelection({
              file: currentFile.startsWith(projectPath + '/') ? currentFile.slice(projectPath.length + 1) : currentFile,
              ...selectionInfo,
            })
            setSelectionInfo(null)
            setPopupPosition(null)
          }}
        />
      )}
    </>
  )
}

export default App
