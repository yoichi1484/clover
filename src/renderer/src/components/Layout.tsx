import { ReactNode, useState, useCallback, useRef, useEffect } from 'react'
import { api } from '../api'

interface LayoutProps {
  toolbar: ReactNode
  sources: ReactNode
  sidebar: ReactNode
  editorHeader: ReactNode
  editor: ReactNode
  preview: ReactNode
  chat: ReactNode
}

interface ResizeHandleProps {
  onResize: (delta: number) => void
}

function ResizeHandle({ onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      startXRef.current = e.clientX
      onResize(delta)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onResize])

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`w-1 flex-shrink-0 cursor-col-resize transition-colors ${
        isDragging ? 'bg-blue-500' : 'bg-gray-700 hover:bg-blue-500'
      }`}
    />
  )
}

export function Layout({ toolbar, sources, sidebar, editorHeader, editor, preview, chat }: LayoutProps): JSX.Element {
  // Check if running in Electron (for window dragging)
  const isElectron = !api.isWeb()

  // Panel widths as flex ratios (1:1:2:2:2 = sources:files:editor:pdf:agent)
  const [sourcesRatio, setSourcesRatio] = useState(1)
  const [sidebarRatio, setSidebarRatio] = useState(1)
  const [editorRatio, setEditorRatio] = useState(2)
  const [previewRatio, setPreviewRatio] = useState(2)
  const [chatRatio, setChatRatio] = useState(2)

  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate total ratio for proper delta scaling
  const totalRatio = sourcesRatio + sidebarRatio + editorRatio + previewRatio + chatRatio

  const handleSourcesResize = useCallback((delta: number) => {
    if (!containerRef.current) return
    const totalWidth = containerRef.current.offsetWidth
    const deltaRatio = (delta / totalWidth) * totalRatio
    // Sources grows/shrinks, sidebar+editor compensates
    setSourcesRatio(r => Math.max(0.5, Math.min(2, r + deltaRatio)))
    setSidebarRatio(r => Math.max(0.5, Math.min(2, r - deltaRatio * 0.5)))
    setEditorRatio(r => Math.max(1, Math.min(4, r - deltaRatio * 0.5)))
  }, [totalRatio])

  const handleSidebarResize = useCallback((delta: number) => {
    if (!containerRef.current) return
    const totalWidth = containerRef.current.offsetWidth
    const deltaRatio = (delta / totalWidth) * totalRatio
    // Sidebar grows/shrinks, editor compensates
    setSidebarRatio(r => Math.max(0.5, Math.min(2, r + deltaRatio)))
    setEditorRatio(r => Math.max(1, Math.min(4, r - deltaRatio)))
  }, [totalRatio])

  const handleEditorResize = useCallback((delta: number) => {
    if (!containerRef.current) return
    const totalWidth = containerRef.current.offsetWidth
    const deltaRatio = (delta / totalWidth) * totalRatio
    // Editor grows/shrinks, preview compensates
    setEditorRatio(r => Math.max(1, Math.min(4, r + deltaRatio)))
    setPreviewRatio(r => Math.max(1, Math.min(4, r - deltaRatio)))
  }, [totalRatio])

  const handlePreviewResize = useCallback((delta: number) => {
    if (!containerRef.current) return
    const totalWidth = containerRef.current.offsetWidth
    const deltaRatio = (delta / totalWidth) * totalRatio
    // Preview grows/shrinks, chat compensates
    setPreviewRatio(r => Math.max(1, Math.min(4, r + deltaRatio)))
    setChatRatio(r => Math.max(1, Math.min(4, r - deltaRatio)))
  }, [totalRatio])

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
      {/* Toolbar - draggable area for Electron window */}
      <div
        className="h-12 border-b border-gray-700 flex-shrink-0"
        style={isElectron ? { WebkitAppRegion: 'drag' } as React.CSSProperties : undefined}
      >
        {toolbar}
      </div>

      {/* Main content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Sources panel */}
        <div style={{ flex: sourcesRatio }} className="h-full overflow-hidden min-w-[80px]">
          {sources}
        </div>

        <ResizeHandle onResize={handleSourcesResize} />

        {/* File tree + Editor group with shared header */}
        <div style={{ flex: sidebarRatio + editorRatio }} className="h-full flex flex-col overflow-hidden min-w-[230px]">
          {/* Shared header */}
          <div className="flex-shrink-0">
            {editorHeader}
          </div>
          {/* Content area with sidebar and editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* File tree sidebar */}
            <div style={{ flex: sidebarRatio }} className="h-full overflow-auto min-w-[80px]">
              {sidebar}
            </div>

            <ResizeHandle onResize={handleSidebarResize} />

            {/* Editor */}
            <div style={{ flex: editorRatio }} className="h-full overflow-hidden min-w-[150px]">
              {editor}
            </div>
          </div>
        </div>

        <ResizeHandle onResize={handleEditorResize} />

        {/* Preview */}
        <div style={{ flex: previewRatio }} className="h-full overflow-hidden min-w-[150px]">
          {preview}
        </div>

        <ResizeHandle onResize={handlePreviewResize} />

        {/* Chat panel */}
        <div style={{ flex: chatRatio }} className="h-full overflow-hidden min-w-[150px]">
          {chat}
        </div>
      </div>
    </div>
  )
}
