import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { FeedbackItem } from '../api/types'

interface FeedbackPanelProps {
  projectPath: string
  feedbackItems: FeedbackItem[]
  pendingSelection: PendingSelection | null
  onAdd: (item: Omit<FeedbackItem, 'id'>) => Promise<void>
  onRemove: (id: string) => void
  onApply: (items: FeedbackItem[]) => void
  onUpdate: (id: string, patch: Partial<FeedbackItem>) => Promise<void>
  onClearPending: () => void
}

export interface PendingSelection {
  file: string
  fromLine: number
  toLine: number
  excerpt: string
}

export function FeedbackPanel({
  feedbackItems,
  pendingSelection,
  onAdd,
  onRemove,
  onApply,
  onUpdate,
  onClearPending,
}: FeedbackPanelProps): JSX.Element {
  const [inputText, setInputText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pendingSelection) inputRef.current?.focus()
  }, [pendingSelection])

  useEffect(() => {
    if (editingId) editRef.current?.focus()
  }, [editingId])

  const handleAdd = async () => {
    if (!inputText.trim() || !pendingSelection) return
    await onAdd({
      file: pendingSelection.file,
      fromLine: pendingSelection.fromLine,
      toLine: pendingSelection.toLine,
      excerpt: pendingSelection.excerpt,
      text: inputText.trim(),
    })
    setInputText('')
    onClearPending()
  }

  const startEdit = (item: FeedbackItem) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const saveEdit = async (id: string) => {
    if (editText.trim()) await onUpdate(id, { text: editText.trim() })
    setEditingId(null)
  }

  const pendingItems = feedbackItems.filter(i => !i.sent)

  return (
    <div className="flex flex-col h-full border-t border-gray-700 bg-[#181818]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#202020] border-b border-gray-800 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-500 tracking-wide">Feedback</span>
        {feedbackItems.length === 0 ? (
          <span className="text-xs text-gray-600">no items</span>
        ) : (
          <span className="text-xs text-gray-600">
            {pendingItems.length > 0 && <span className="text-blue-400/70">{pendingItems.length} pending</span>}
            {pendingItems.length > 0 && feedbackItems.length - pendingItems.length > 0 && <span className="text-gray-700"> · </span>}
            {feedbackItems.length - pendingItems.length > 0 && <span>{feedbackItems.length - pendingItems.length} sent</span>}
          </span>
        )}
        <button
          onClick={() => onApply(pendingItems)}
          disabled={pendingItems.length === 0}
          className="ml-auto px-3 py-0.5 text-xs bg-[#1a2a3a] border border-[#2a4a6a] text-blue-400 rounded hover:bg-[#2a3a4a] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Send All
        </button>
      </div>

      {/* Add bar */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-800 flex-shrink-0">
        {pendingSelection && (
          <span className="text-xs text-blue-400 bg-[#1a2a3a] border border-[#2a3a4a] rounded px-2 py-0.5 flex-shrink-0 max-w-[140px] truncate">
            "{pendingSelection.excerpt.slice(0, 20)}{pendingSelection.excerpt.length > 20 ? '…' : ''}"
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd()
            if (e.key === 'Escape') { setInputText(''); onClearPending() }
          }}
          placeholder={pendingSelection ? 'Enter feedback...' : 'Select text in editor first'}
          disabled={!pendingSelection}
          className="flex-1 bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-blue-600 disabled:opacity-40"
        />
        {pendingSelection && (
          <button
            onClick={() => { setInputText(''); onClearPending() }}
            className="text-gray-600 hover:text-gray-400 text-xs px-1"
          >
            ✕
          </button>
        )}
        <button
          onClick={handleAdd}
          disabled={!pendingSelection || !inputText.trim()}
          className="px-2 py-1 text-xs border border-[#3a3a3a] text-gray-500 rounded hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 min-h-0">
        {feedbackItems.length === 0 && !pendingSelection && (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-600">
            Select text in the editor to add feedback
          </div>
        )}
        {feedbackItems.map(item => (
          <div
            key={item.id}
            className={`flex gap-2 items-center border rounded px-2 py-1.5 transition-colors ${
              item.sent ? 'bg-[#1a1a1a] border-[#252525]' : 'bg-[#1e1e1e] border-[#2d2d2d]'
            }`}
          >
            {/* Meta */}
            <div className="min-w-[80px] flex-shrink-0">
              <div className={`text-xs ${item.sent ? 'text-blue-400/40' : 'text-blue-400'}`}>
                {item.file}:{item.fromLine}{item.fromLine !== item.toLine ? `–${item.toLine}` : ''}
              </div>
              <div className="text-xs text-gray-600 italic truncate max-w-[78px]">"{item.excerpt}"</div>
            </div>

            {/* Text / Edit input */}
            <div className="flex-1 min-w-0">
              {editingId === item.id ? (
                <input
                  ref={editRef}
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(item.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="w-full bg-[#252525] border border-blue-600 rounded px-1.5 py-0.5 text-xs text-gray-300 outline-none"
                />
              ) : (
                <div className={`text-xs leading-relaxed ${item.sent ? 'text-gray-600' : 'text-gray-300'}`}>
                  {item.text}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {editingId === item.id ? (
                <>
                  <button
                    onClick={() => saveEdit(item.id)}
                    className="px-2 py-0.5 text-xs border border-blue-700 text-blue-400 rounded hover:bg-[#1a2a3a]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-400 text-xs px-1"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onApply([item])}
                    disabled={!!item.sent}
                    className="px-2 py-0.5 text-xs border border-[#2a4a6a] text-blue-400 rounded hover:bg-[#1a2a3a] disabled:opacity-25 disabled:cursor-not-allowed disabled:border-[#2a2a2a] disabled:text-gray-600"
                  >
                    Send
                  </button>
                  {/* Toggle: sent state — ON=未送信(青), OFF=送信済み(灰) */}
                  <label className="relative inline-flex items-center gap-1.5 cursor-pointer" title={item.sent ? 'Mark as unsent' : 'Mark as sent'}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!item.sent}
                      onChange={e => onUpdate(item.id, { sent: !e.target.checked })}
                    />
                    <div className={`w-7 h-3.5 rounded-full transition-colors ${!item.sent ? 'bg-blue-700' : 'bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-transform ${!item.sent ? 'translate-x-4 bg-blue-300' : 'translate-x-0.5 bg-gray-500'}`} />
                    </div>
                  </label>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-gray-600 hover:text-gray-400 p-0.5 rounded hover:bg-[#2a2a2a]"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-gray-600 hover:text-red-400 text-xs px-1"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
