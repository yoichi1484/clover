import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorTheme } from '../themes/latexThemes'

interface EditorState {
  currentFile: string | null
  content: string
  isDirty: boolean
  pdfPath: string | null
  isCompiling: boolean
  compileOutput: string
  compileError: string | null
  editorTheme: EditorTheme
  diffMode: boolean
  selectedCommit: { hash: string; message: string; date: string } | null
  diffOriginalContent: string

  setCurrentFile: (path: string | null) => void
  setContent: (content: string) => void
  setDirty: (dirty: boolean) => void
  setPdfPath: (path: string | null) => void
  setCompiling: (compiling: boolean) => void
  appendCompileOutput: (output: string) => void
  clearCompileOutput: () => void
  setCompileError: (error: string | null) => void
  setEditorTheme: (theme: EditorTheme) => void
  setDiffMode: (mode: boolean) => void
  setSelectedCommit: (commit: { hash: string; message: string; date: string } | null) => void
  setDiffOriginalContent: (content: string) => void
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      currentFile: null,
      content: '',
      isDirty: false,
      pdfPath: null,
      isCompiling: false,
      compileOutput: '',
      compileError: null,
      editorTheme: 'nord',
      diffMode: false,
      selectedCommit: null,
      diffOriginalContent: '',

      setCurrentFile: (path) => set({ currentFile: path }),
      setContent: (content) => set({ content, isDirty: true }),
      setDirty: (isDirty) => set({ isDirty }),
      setPdfPath: (pdfPath) => set({ pdfPath }),
      setCompiling: (isCompiling) => set({ isCompiling }),
      appendCompileOutput: (output) => set((state) => ({
        compileOutput: state.compileOutput + output
      })),
      clearCompileOutput: () => set({ compileOutput: '' }),
      setCompileError: (compileError) => set({ compileError }),
      setEditorTheme: (editorTheme) => set({ editorTheme }),
      setDiffMode: (diffMode) => set({ diffMode }),
      setSelectedCommit: (selectedCommit) => set({ selectedCommit }),
      setDiffOriginalContent: (diffOriginalContent) => set({ diffOriginalContent })
    }),
    {
      name: 'editor-settings',
      partialize: (state) => ({ editorTheme: state.editorTheme })
    }
  )
)
