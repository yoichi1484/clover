import { useState, useMemo } from 'react'
import { FileText, Image, Table, File, Plus, X } from 'lucide-react'
import { Source } from '../store/projectStore'

function FileIcon({ name }: { name?: string }): JSX.Element {
  const ext = name?.split('.').pop()?.toLowerCase()
  const iconProps = { size: 14, className: 'text-gray-400' }

  switch (ext) {
    case 'pdf':
      return <FileText {...iconProps} />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <Image {...iconProps} />
    case 'csv':
    case 'xlsx':
    case 'xls':
      return <Table {...iconProps} />
    case 'txt':
    case 'md':
      return <FileText {...iconProps} />
    default:
      return <File {...iconProps} />
  }
}

interface SourceItemProps {
  source: Source
  onToggleEnabled: (id: string, enabled: boolean) => void
  onClick: () => void
}

function SourceItem({ source, onToggleEnabled, onClick }: SourceItemProps): JSX.Element {
  const isEnabled = source.enabled !== false // undefined or true = enabled

  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded text-sm cursor-pointer ${
        !isEnabled ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <input
        type="checkbox"
        checked={isEnabled}
        onClick={(e) => {
          e.stopPropagation()
          onToggleEnabled(source.id, !isEnabled)
        }}
        onChange={() => {}}
        className="w-4 h-4 cursor-pointer"
        style={{ accentColor: '#6b7280' }}
      />
      <FileIcon name={source.name || source.title} />
      <span
        className={`flex-1 truncate ${!isEnabled ? 'line-through' : ''}`}
        title={source.path || source.url}
      >
        {source.name || source.title || source.id}
      </span>
    </div>
  )
}

interface SourceDetailModalProps {
  source: Source
  onClose: () => void
}

function SourceDetailModal({ source, onClose }: SourceDetailModalProps): JSX.Element {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#323232] rounded-lg w-[400px] max-h-[500px] flex flex-col shadow-2xl border border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600 bg-[#3a3a3a] rounded-t-lg">
          <h2 className="text-lg font-medium text-gray-200">Source Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-600 rounded text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <div className="text-gray-200">{source.name || source.title || source.id}</div>
          </div>

          {source.type && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <div className="text-gray-200">{source.type}</div>
            </div>
          )}

          {(source.path || source.url) && (
            <div>
              <div className="text-xs text-gray-500 mb-1">{source.path ? 'Path' : 'URL'}</div>
              <div className="text-gray-200 text-sm break-all">{source.path || source.url}</div>
            </div>
          )}

          {source.url && (
            <div>
              <div className="text-xs text-gray-500 mb-1">URL</div>
              <div className="text-gray-200 text-sm break-all">{source.url}</div>
            </div>
          )}

          {source.tags && source.tags.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Tags</div>
              <div className="flex flex-wrap gap-1">
                {source.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-gray-500 mb-1">Added</div>
            <div className="text-gray-200">{formatDate(source.addedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SourcesPanelProps {
  sources: Source[]
  onAddSources: () => void
  onRemoveSource: (id: string) => void
  onToggleSourceEnabled: (id: string, enabled: boolean) => void
}

export function SourcesPanel({
  sources,
  onAddSources,
  onRemoveSource,
  onToggleSourceEnabled
}: SourcesPanelProps): JSX.Element {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)

  // Sort sources by addedAt descending (newest first)
  // Sources without addedAt go to the bottom
  const sortedSources = useMemo(() => {
    return [...sources].sort((a, b) => {
      const timeA = a.addedAt ? new Date(a.addedAt).getTime() : 0
      const timeB = b.addedAt ? new Date(b.addedAt).getTime() : 0
      return timeB - timeA
    })
  }, [sources])

  // Count enabled sources
  const enabledCount = sources.filter(s => s.enabled !== false).length

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {enabledCount}/{sources.length} source{sources.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onAddSources}
          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-700 rounded text-sm flex items-center gap-1"
        >
          <Plus size={14} />
          <span>Add Sources</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {sources.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No sources added yet
          </div>
        ) : (
          <div className="space-y-1">
            {sortedSources.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                onToggleEnabled={onToggleSourceEnabled}
                onClick={() => setSelectedSource(source)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSource && (
        <SourceDetailModal
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  )
}
