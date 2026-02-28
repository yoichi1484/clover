import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerFileSystemHandlers } from './services/fileSystem'
import { registerTexCompilerHandlers } from './services/texCompiler'
import { registerProjectManagerHandlers } from './services/projectManager'
import { registerSourceManagerHandlers } from './services/sourceManager'
import { registerLatexmkConfigHandlers } from './services/latexmkConfig'
import { registerPtyManagerHandlers, setPtyProjectPath } from './services/ptyManager'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 10, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Fullscreen state change events
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullScreenChange', true)
  })
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullScreenChange', false)
  })

  // Handler to check current fullscreen state
  ipcMain.handle('window:isFullScreen', () => {
    return mainWindow.isFullScreen()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.clover')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerFileSystemHandlers()
  registerTexCompilerHandlers()
  registerPtyManagerHandlers()
  registerProjectManagerHandlers()
  registerSourceManagerHandlers()
  registerLatexmkConfigHandlers()

  // PTY project path handler
  ipcMain.handle('pty:setProjectPath', (_event, path: string | null) => {
    setPtyProjectPath(path)
  })

  // Get app path for skills directory
  ipcMain.handle('app:getSkillsPath', () => {
    // In development, use the source directory
    // In production, use the app resources directory
    if (is.dev) {
      return join(__dirname, '../../clover-skills')
    } else {
      return join(process.resourcesPath, 'clover-skills')
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
