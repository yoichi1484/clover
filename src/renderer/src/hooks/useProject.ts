import { useCallback, useEffect, useRef } from 'react'
import { useProjectStore, useEditorStore } from '../store'
import { api } from '../api'

// Get Zustand store for direct access outside React lifecycle
const getEditorState = () => useEditorStore.getState()
const getProjectState = () => useProjectStore.getState()

interface CompileCallbacks {
  onCompileError?: (error: string, log: string) => void
}

export function useProject(callbacks?: CompileCallbacks) {
  const projectStore = useProjectStore()
  const editorStore = useEditorStore()

  // Use refs to avoid stale closures
  const editorStoreRef = useRef(editorStore)
  const projectStoreRef = useRef(projectStore)
  const callbacksRef = useRef(callbacks)
  editorStoreRef.current = editorStore
  projectStoreRef.current = projectStore
  callbacksRef.current = callbacks

  const openProject = useCallback(async (path: string) => {
    projectStore.setLoading(true)

    try {
      // Load or create config
      let config = await api.loadProjectConfig(path)

      if (!config) {
        // New project, will be configured via dialog
        projectStore.setProjectPath(path)
        // Set PTY project path for security validation
        await api.setPtyProjectPath(path)
        return false
      }

      projectStore.setProjectPath(path)
      projectStore.setConfig(config)

      // Add to recent projects
      await api.addRecentProject(path)

      // Set PTY project path for security validation
      await api.setPtyProjectPath(path)

      // Start file watcher first (this sets the project path for security validation)
      await api.watchDirectory(path)

      // Load files (requires watcher to be started for security validation)
      const files = await api.listFiles(path)
      projectStore.setFiles(files)

      // Restore last opened file if it exists
      if (config.lastOpenedFile) {
        try {
          const fullPath = config.lastOpenedFile.startsWith('/') ? config.lastOpenedFile : `${path}/${config.lastOpenedFile}`
          const content = await api.readFile(fullPath)
          editorStore.setCurrentFile(fullPath)
          editorStore.setContent(content)
          editorStore.setDirty(false)
        } catch (error) {
          // File might have been deleted, ignore
          console.warn('Failed to restore last opened file:', error)
        }
      }

      return true
    } catch (error) {
      console.error('Failed to open project:', error)
      projectStore.reset()
      throw error
    } finally {
      projectStore.setLoading(false)
    }
  }, [projectStore, editorStore])

  const createProject = useCallback(async (
    path: string,
    title: string,
    template: string,
    agent: 'claude' | 'codex',
    texCommand: string
  ) => {
    try {
      const now = new Date().toISOString()
      const config = {
        title,
        template,
        agent,
        texCommand,
        mainFile: 'main.tex',
        resourcesDir: 'resources',
        enableClaudeSkills: true,  // Enable by default
        createdAt: now,
        updatedAt: now
      }

      await api.saveProjectConfig(path, config)
      await api.addRecentProject(path)

      projectStore.setProjectPath(path)
      projectStore.setConfig(config)

      // Set PTY project path for security validation
      await api.setPtyProjectPath(path)

      // Start file watcher first (this sets the project path for security validation)
      await api.watchDirectory(path)

      // Load files (requires watcher to be started for security validation)
      const files = await api.listFiles(path)
      projectStore.setFiles(files)
    } catch (error) {
      console.error('Failed to create project:', error)
      projectStore.reset()
      throw error
    }
  }, [projectStore])

  const closeProject = useCallback(async () => {
    try {
      await api.unwatchDirectory()
    } catch (error) {
      console.error('Failed to unwatch directory:', error)
    }
    // Clear PTY project path
    await api.setPtyProjectPath(null)
    projectStore.reset()
    editorStore.setCurrentFile(null)
    editorStore.setContent('')
  }, [projectStore, editorStore])

  const openFile = useCallback(async (filePath: string) => {
    try {
      // Save current file if dirty
      if (editorStore.isDirty && editorStore.currentFile) {
        await api.writeFile(editorStore.currentFile, editorStore.content)
      }

      const content = await api.readFile(filePath)
      editorStore.setCurrentFile(filePath)
      editorStore.setContent(content)
      editorStore.setDirty(false)

      // Save last opened file to config
      const project = getProjectState()
      if (project.projectPath && project.config) {
        const updatedConfig = {
          ...project.config,
          lastOpenedFile: filePath.startsWith(project.projectPath + '/') ? filePath.slice(project.projectPath.length + 1) : filePath,
          updatedAt: new Date().toISOString()
        }
        await api.saveProjectConfig(project.projectPath, updatedConfig)
        projectStoreRef.current.setConfig(updatedConfig)
      }
    } catch (error) {
      console.error('Failed to open file:', error)
      throw error
    }
  }, [editorStore])

  const saveCurrentFile = useCallback(async () => {
    if (!editorStore.currentFile) return
    try {
      await api.writeFile(editorStore.currentFile, editorStore.content)
      editorStore.setDirty(false)
    } catch (error) {
      console.error('Failed to save file:', error)
      throw error
    }
  }, [editorStore])

  const compile = useCallback(async () => {
    console.log('=== COMPILE CALLED ===')
    // Use getState() to get fresh state at execution time
    const project = getProjectState()
    const editor = getEditorState()
    console.log('Project state:', { projectPath: project.projectPath, config: project.config })
    console.log('Editor state:', { currentFile: editor.currentFile, contentLength: editor.content?.length })
    const { projectPath, config } = project
    if (!projectPath || !config) {
      console.log('No projectPath or config, returning early')
      return
    }

    editor.setCompiling(true)
    editor.clearCompileOutput()
    editor.setCompileError(null)

    try {
      // Get fresh state again for current file info
      const freshEditor = getEditorState()
      const currentFile = freshEditor.currentFile
      const content = freshEditor.content

      if (currentFile) {
        console.log('Saving file before compile:', currentFile, 'content length:', content.length)
        await api.writeFile(currentFile, content)
        getEditorState().setDirty(false)
      }

      const result = await api.compileTex(projectPath, config.mainFile)
      console.log('Compile result - success:', result.success, 'error:', result.error, 'pdfPath:', result.pdfPath)

      if (result.success && result.pdfPath) {
        getEditorState().setPdfPath(result.pdfPath)
        getEditorState().setCompileError(null)
      } else if (result.error) {
        console.error('Compilation failed:', result.error)
        getEditorState().setCompileError(result.error)
        // Call onCompileError callback if set
        if (callbacksRef.current?.onCompileError) {
          console.log('Calling onCompileError callback')
          callbacksRef.current.onCompileError(result.error, result.log || '')
        }
      }
    } catch (error) {
      console.error('Failed to compile:', error)
    } finally {
      getEditorState().setCompiling(false)
    }
  }, [])

  // Set up IPC listeners with proper cleanup
  useEffect(() => {
    const cleanupCompileOutput = api.onCompileOutput((data) => {
      editorStoreRef.current.appendCompileOutput(data)
    })

    const cleanupFileChange = api.onFileChange((event, path) => {
      const editor = editorStoreRef.current
      const project = projectStoreRef.current

      // Reload current file if it changed externally
      if (path === editor.currentFile && !editor.isDirty) {
        api.readFile(path).then((content) => {
          editorStoreRef.current.setContent(content)
          editorStoreRef.current.setDirty(false)
        }).catch((err) => {
          console.error('Failed to reload file:', err)
        })
      }

      // Reload file tree
      if (project.projectPath) {
        api.listFiles(project.projectPath).then((files) => {
          projectStoreRef.current.setFiles(files)
        }).catch((err) => {
          console.error('Failed to reload file list:', err)
        })
      }

      // Reload project config when config.json changes (e.g., when agent modifies it)
      if (path.endsWith('config.json') && path.includes('.clover') && project.projectPath) {
        api.loadProjectConfig(project.projectPath).then((config) => {
          if (config) {
            projectStoreRef.current.setConfig(config)
          }
        }).catch((err) => {
          console.error('Failed to reload project config:', err)
        })
      }

      // Reload PDF if it changed
      if (path.endsWith('.pdf') && path === editor.pdfPath) {
        // Trigger PDF reload by resetting and setting the path
        const currentPath = editor.pdfPath
        editorStoreRef.current.setPdfPath(null)
        setTimeout(() => editorStoreRef.current.setPdfPath(currentPath), 100)
      }
    })

    // Cleanup listeners on unmount
    return () => {
      cleanupCompileOutput?.()
      cleanupFileChange?.()
    }
  }, [])

  return {
    openProject,
    createProject,
    closeProject,
    openFile,
    saveCurrentFile,
    compile
  }
}
