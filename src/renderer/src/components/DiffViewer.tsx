import { useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { useEditorStore } from '../store/editorStore'
import { getTheme } from '../themes/latexThemes'

interface DiffViewerProps {
  original: string
  modified: string
}

export function DiffViewer({ original, modified }: DiffViewerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IDiffEditor | null>(null)
  const originalModelRef = useRef<monaco.editor.ITextModel | null>(null)
  const modifiedModelRef = useRef<monaco.editor.ITextModel | null>(null)
  const editorTheme = useEditorStore(state => state.editorTheme)

  useEffect(() => {
    if (!containerRef.current) return

    // Define theme
    const themeName = `latex-${editorTheme}`
    monaco.editor.defineTheme(themeName, getTheme(editorTheme))

    const originalModel = monaco.editor.createModel(original, 'latex')
    const modifiedModel = monaco.editor.createModel(modified, 'latex')
    originalModelRef.current = originalModel
    modifiedModelRef.current = modifiedModel

    const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
      theme: themeName,
      readOnly: true,
      originalEditable: false,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      renderSideBySide: true,
    })

    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    })

    editorRef.current = diffEditor

    return () => {
      diffEditor.dispose()
      originalModel.dispose()
      modifiedModel.dispose()
    }
  }, [])

  // Update content when props change
  useEffect(() => {
    if (originalModelRef.current) {
      originalModelRef.current.setValue(original)
    }
    if (modifiedModelRef.current) {
      modifiedModelRef.current.setValue(modified)
    }
  }, [original, modified])

  return <div ref={containerRef} className="h-full w-full" />
}
