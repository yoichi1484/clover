// src/renderer/src/components/DirectoryBrowser.tsx

import { useState, useEffect } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, X } from 'lucide-react'
import { api, onWebEvent, resolveDirectorySelection } from '../api'

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  isExpanded: boolean
  children: FileNode[] | null
}

type BrowserMode = 'directory' | 'file'

export function DirectoryBrowser() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<BrowserMode>('directory')
  const [rootNodes, setRootNodes] = useState<FileNode[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [homePath, setHomePath] = useState<string>('')

  useEffect(() => {
    // Listen for open directory event from web API
    const unsubscribeDir = onWebEvent('openDirectoryBrowser', () => {
      setMode('directory')
      setIsOpen(true)
      loadRootDirectory('directory')
    })
    // Listen for open file browser event from web API
    const unsubscribeFile = onWebEvent('openFileBrowser', () => {
      setMode('file')
      setIsOpen(true)
      loadRootDirectory('file')
    })
    return () => {
      unsubscribeDir()
      unsubscribeFile()
    }
  }, [])

  const loadRootDirectory = async (browserMode: BrowserMode) => {
    try {
      // Get home directory from server
      const response = await fetch('/api/directories/home')
      const { homePath: home } = await response.json()
      setHomePath(home)

      const files = await api.listFiles(home)
      // In directory mode, only show directories. In file mode, show all.
      const filteredFiles = browserMode === 'directory'
        ? files.filter(f => f.isDirectory)
        : files
      setRootNodes(filteredFiles.map(f => ({
        name: f.name,
        path: f.path,
        isDirectory: f.isDirectory,
        isExpanded: false,
        children: null
      })))
    } catch (err) {
      console.error('Failed to load directory:', err)
    }
  }

  const toggleExpand = async (node: FileNode) => {
    if (!node.isDirectory) return

    if (node.children === null) {
      // Load children
      try {
        const files = await api.listFiles(node.path)
        // In directory mode, only show directories. In file mode, show all.
        const filteredFiles = mode === 'directory'
          ? files.filter(f => f.isDirectory)
          : files
        node.children = filteredFiles.map(f => ({
          name: f.name,
          path: f.path,
          isDirectory: f.isDirectory,
          isExpanded: false,
          children: null
        }))
      } catch {
        node.children = []
      }
    }
    node.isExpanded = !node.isExpanded
    setRootNodes([...rootNodes])
  }

  const handleSelect = () => {
    resolveDirectorySelection(selectedPath)
    setIsOpen(false)
    setSelectedPath(null)
  }

  const handleCancel = () => {
    resolveDirectorySelection(null)
    setIsOpen(false)
    setSelectedPath(null)
  }

  const renderNode = (node: FileNode, depth: number = 0) => (
    <div key={node.path}>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-gray-600 ${
          selectedPath === node.path ? 'bg-indigo-700 text-white' : 'text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setSelectedPath(node.path)}
        onDoubleClick={() => node.isDirectory && toggleExpand(node)}
      >
        {node.isDirectory ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(node)
              }}
              className="p-0.5 hover:bg-gray-500 rounded text-gray-400"
            >
              {node.isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
            {node.isExpanded ? (
              <FolderOpen size={16} className="text-blue-400" />
            ) : (
              <Folder size={16} className="text-blue-400" />
            )}
          </>
        ) : (
          <>
            <div className="w-[22px]" /> {/* Spacer to align with folders */}
            <FileText size={16} className="text-gray-400" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#323232] rounded-lg w-[500px] max-h-[600px] flex flex-col shadow-2xl border border-gray-600">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600 bg-[#3a3a3a] rounded-t-lg">
          <h2 className="text-lg font-medium text-gray-200">
            {mode === 'directory' ? 'Select Directory' : 'Select File'}
          </h2>
          <button onClick={handleCancel} className="p-1 hover:bg-gray-600 rounded text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-2 border-b border-gray-600 text-sm text-gray-400 bg-[#2a2a2a]">
          {homePath}
        </div>

        <div className="flex-1 overflow-auto p-2 min-h-[300px] bg-[#1e1e1e]">
          {rootNodes.length === 0 ? (
            <div className="text-gray-500 text-sm p-4">Loading...</div>
          ) : (
            rootNodes.map(node => renderNode(node))
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-600 bg-[#323232] rounded-b-lg">
          <div className="text-sm text-gray-400 mb-3 truncate">
            Selected: {selectedPath || 'None'}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedPath}
              className="px-4 py-2 text-sm bg-indigo-700 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
