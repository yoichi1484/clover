import { useState } from 'react'
import { api } from '../api'

export interface NewProjectSettings {
  path: string
  title: string
  template: string
  agent: 'claude' | 'codex'
  texCommand: string
}

interface NewProjectDialogProps {
  isOpen: boolean
  selectedPath: string
  onClose: () => void
  onConfirm: (settings: NewProjectSettings) => void
}

export function NewProjectDialog({
  isOpen,
  selectedPath,
  onClose,
  onConfirm
}: NewProjectDialogProps): JSX.Element | null {
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState('')
  const [agent, setAgent] = useState<'claude' | 'codex'>('claude')
  const [texCommand, setTexCommand] = useState('pdflatex')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      path: selectedPath,
      title,
      template,
      agent,
      texCommand
    })
  }

  const handleSelectTemplate = async () => {
    const path = await api.selectDirectory()
    if (path) {
      setTemplate(path)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[480px]">
        <h2 className="text-xl font-bold mb-4">New Project Settings</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Project Folder
            </label>
            <div className="text-sm text-gray-400 bg-gray-900 px-3 py-2 rounded truncate">
              {selectedPath}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Project Name (Paper Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder="My Paper"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Template (folder with .cls/.sty files, optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                placeholder="Optional"
              />
              <button
                type="button"
                onClick={handleSelectTemplate}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Agent
            </label>
            <select
              value={agent}
              onChange={(e) => setAgent(e.target.value as 'claude' | 'codex')}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="claude">Claude</option>
              <option value="codex">Codex</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-1">
              TeX Command
            </label>
            <select
              value={texCommand}
              onChange={(e) => setTexCommand(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="pdflatex">pdflatex</option>
              <option value="xelatex">xelatex</option>
              <option value="lualatex">lualatex</option>
              <option value="platex">platex</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-700 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
