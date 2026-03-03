import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, FileText, FileCode, File, Image, Folder } from 'lucide-react'
import { useProjectStore, FileEntry } from '../store'
import { api } from '../api'

interface FileTreeItemProps {
  entry: FileEntry
  depth: number
  onSelect: (path: string) => void
  selectedPath: string | null
  gitStatuses?: Map<string, string>
}

function FileTreeItem({ entry, depth, onSelect, selectedPath, gitStatuses }: FileTreeItemProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [children, setChildren] = useState<FileEntry[]>([])

  const handleClick = async () => {
    if (entry.isDirectory) {
      if (!isOpen && children.length === 0) {
        const files = await api.listFiles(entry.path)
        setChildren(files)
      }
      setIsOpen(!isOpen)
    } else {
      onSelect(entry.path)
    }
  }

  const isSelected = selectedPath === entry.path

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-gray-700 ${
          isSelected ? 'bg-gray-700' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {entry.isDirectory ? (
          <ChevronRight
            size={14}
            className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        {entry.isDirectory ? (
          <Folder size={14} className="text-blue-400 flex-shrink-0" />
        ) : (
          <FileIcon name={entry.name} />
        )}
        <span className="text-sm truncate">{entry.name}</span>
        {(() => {
          if (!gitStatuses || entry.isDirectory) return null
          // Try to find status by matching the end of the path
          for (const [relativePath, status] of gitStatuses.entries()) {
            if (entry.path.endsWith(relativePath)) {
              return (
                <span className={`ml-1 text-xs font-mono flex-shrink-0 ${
                  status === 'M' ? 'text-yellow-400' :
                  status === '??' ? 'text-green-400' :
                  status === 'D' ? 'text-red-400' :
                  status === 'A' ? 'text-green-400' :
                  'text-gray-400'
                }`}>
                  {status === '??' ? 'U' : status}
                </span>
              )
            }
          }
          return null
        })()}
      </div>
      {isOpen && children.map((child) => (
        <FileTreeItem
          key={child.path}
          entry={child}
          depth={depth + 1}
          onSelect={onSelect}
          selectedPath={selectedPath}
          gitStatuses={gitStatuses}
        />
      ))}
    </div>
  )
}

function FileIcon({ name }: { name: string }): JSX.Element {
  const iconProps = { size: 14, className: 'text-gray-400 flex-shrink-0' }

  // LaTeX files
  if (name.endsWith('.tex')) return <FileCode {...iconProps} className="text-green-400 flex-shrink-0" />
  if (name.endsWith('.bib')) return <FileText {...iconProps} className="text-yellow-400 flex-shrink-0" />
  if (name.endsWith('.sty') || name.endsWith('.cls')) return <FileCode {...iconProps} className="text-green-300 flex-shrink-0" />

  // Documents
  if (name.endsWith('.pdf')) return <FileText {...iconProps} className="text-red-400 flex-shrink-0" />
  if (name.endsWith('.md') || name.endsWith('.markdown') || name.endsWith('.txt')) return <FileText {...iconProps} className="text-blue-300 flex-shrink-0" />

  // Images
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.svg')) {
    return <Image {...iconProps} className="text-purple-400 flex-shrink-0" />
  }

  // Code files
  if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx')) {
    return <FileCode {...iconProps} className="text-blue-400 flex-shrink-0" />
  }

  // Config files
  if (name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml') || name.endsWith('.toml')) {
    return <FileCode {...iconProps} className="text-orange-400 flex-shrink-0" />
  }

  return <File {...iconProps} />
}

interface FileTreeProps {
  onFileSelect: (path: string) => void
  selectedPath: string | null
  gitStatuses?: Map<string, string>
}

export function FileTree({ onFileSelect, selectedPath, gitStatuses }: FileTreeProps): JSX.Element {
  const { projectPath, files, setFiles } = useProjectStore()

  const loadFiles = useCallback(async () => {
    if (!projectPath) return
    const entries = await api.listFiles(projectPath)
    setFiles(entries)
  }, [projectPath, setFiles])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Note: File watcher is managed by useProject hook, not here
  // This prevents duplicate watchers and cleanup race conditions

  if (!projectPath) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Please open a project
      </div>
    )
  }

  return (
    <div className="py-2">
      {files.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          depth={0}
          onSelect={onFileSelect}
          selectedPath={selectedPath}
          gitStatuses={gitStatuses}
        />
      ))}
    </div>
  )
}
