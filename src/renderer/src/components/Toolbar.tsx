import { useState, useEffect } from 'react'
import { useProjectStore } from '../store'
import { Club, Home, Settings } from 'lucide-react'
import { api } from '../api'

interface ToolbarProps {
  onNewProject: () => void
  onOpenProject: () => void
  onSettings: () => void
  onHome: () => void
}

export function Toolbar({ onNewProject, onOpenProject, onSettings, onHome }: ToolbarProps): JSX.Element {
  const { config } = useProjectStore()

  // Add padding for Mac traffic lights in Electron app
  const isElectronMac = !api.isWeb() && navigator.platform.toLowerCase().includes('mac')

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
  const showTrafficLightSpacer = isElectronMac && !isFullscreen

  return (
    <div className="h-full relative flex items-center px-4 gap-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Mac traffic light spacer */}
      {showTrafficLightSpacer && <div className="w-16" />}

      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNewProject}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          New
        </button>

        <button
          onClick={onOpenProject}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          Open
        </button>

        <button
          onClick={onHome}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="Home"
        >
          <Home size={14} />
          <span>Home</span>
        </button>

        <button
          onClick={onSettings}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="Settings"
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>

      {/* Center section - absolutely positioned for true centering */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <Club size={20} className="text-green-400" />
        <span className="text-sm font-medium">
          <span className="text-green-400">Clo</span>
          <span className="text-green-400">ver</span>
        </span>
      </div>

      {/* Right section - use flex-1 to push to right */}
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {config && (
          <span className="text-sm text-gray-400">
            {config.title || 'Untitled'}
          </span>
        )}
      </div>
    </div>
  )
}
