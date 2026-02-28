import { useState, useEffect } from 'react'
import { Club, Plus } from 'lucide-react'
import { api } from '../api'

interface ProjectInfo {
  path: string
  title: string
  createdAt: string
  updatedAt: string
}

interface StartScreenProps {
  onNewProject: () => void
  onOpenProject: () => void
  onOpenRecent: (path: string) => void
}

export function StartScreen({ onNewProject, onOpenRecent }: StartScreenProps): JSX.Element {
  const [projects, setProjects] = useState<ProjectInfo[]>([])

  useEffect(() => {
    api.getRecentProjects()
      .then((recentProjects) => {
        // API now returns RecentProject[] directly
        const projectInfos: ProjectInfo[] = recentProjects.map((p) => ({
          path: p.path,
          title: p.title || p.path.split('/').pop() || 'Untitled',
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || ''
        }))
        setProjects(projectInfos)
      })
      .catch((err) => console.error('Failed to load recent projects:', err))
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if running in Electron (for window dragging)
  const isElectron = !api.isWeb()

  // Detect fullscreen mode using Electron API
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Get initial fullscreen state
    api.isFullScreen().then(setIsFullscreen)

    // Listen for fullscreen changes
    const unsubscribe = api.onFullScreenChange(setIsFullscreen)
    return unsubscribe
  }, [])

  // Show spacer only on Electron + Mac + not fullscreen
  const showTrafficLightSpacer = isElectron && navigator.platform.toLowerCase().includes('mac') && !isFullscreen

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
      {/* Header - draggable area for Electron window */}
      <div
        className="relative flex items-center px-6 py-4 border-b border-gray-700"
        style={isElectron ? { WebkitAppRegion: 'drag' } as React.CSSProperties : undefined}
      >
        {/* Center logo - absolutely positioned */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <Club size={24} className="text-green-400" />
          <span className="text-lg font-medium">
            <span className="text-green-400">Clo</span>
            <span className="text-green-400">ver</span>
          </span>
        </div>

        {/* Right button - pushed to right */}
        <div className="flex-1" />
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-700 rounded-lg"
          style={isElectron ? { WebkitAppRegion: 'no-drag' } as React.CSSProperties : undefined}
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-300">Projects</h2>

        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No projects yet. Create a new project to get started.
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-750 border-b border-gray-700 text-sm text-gray-400 font-medium">
              <div>Title</div>
              <div>Updated</div>
              <div>Created</div>
              <div>Location</div>
            </div>

            {/* Table rows */}
            {projects.map((project) => (
              <button
                key={project.path}
                onClick={() => onOpenRecent(project.path)}
                className="w-full grid grid-cols-4 gap-4 px-4 py-3 text-left hover:bg-gray-700 text-sm border-b border-gray-700 last:border-b-0"
              >
                <div className="font-medium truncate">{project.title}</div>
                <div className="text-gray-400">{formatDate(project.updatedAt)}</div>
                <div className="text-gray-400">{formatDate(project.createdAt)}</div>
                <div className="text-gray-400 truncate">{project.path}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
