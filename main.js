// Import required scripts
const { app, BrowserWindow, globalShortcut, Menu, MenuItem, Tray } = require('electron')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const shorcutReigster = require('./shortcutRegister')
const discordRPC = require('./discordRPC')

// Create Main Window object
let mainWindow

// Create and register new menu
const menu = new Menu()

// For use with window closing
let playerIsShowing = false
let playerIsQuiting = false

// Initialize Main Window
function createWindow () {
  mainWindow = new BrowserWindow({ 
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'), // Used for IPC/Communication with main process
      nodeIntegration: false, // Don't let the website touch the user's PC!!!!!!!
      sandbox: true, // Put the app into a sandbox (more security)
      contextIsolation: false // Allow the preload script to touch the Electron/NodeJS libs
    }
  })

  // Go to Google Play Music's website
  mainWindow.loadURL('http://play.google.com/music/listen')

  // Only open the dev tools automatically if the app is in dev mode
  if (process.env.isDev) mainWindow.webContents.openDevTools()

  // The app is definately showing now
  playerIsShowing = true

  // Handle closing event
  mainWindow.on('close', (e) => {
    console.log(playerIsQuiting)
    if (playerIsQuiting) {
      e.returnValue = playerIsQuiting
    } else {
      mainWindow.hide()
      playerIsShowing = false
    }
  })

  // Kill everything when closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // When app fully loaded, inject our custom script
  mainWindow.webContents.once('dom-ready', () => {
    const inject = fs.readFileSync(path.join(__dirname, 'inject.js'), { encoding: 'utf8' }) // Our custom script
    mainWindow.webContents.executeJavaScript(inject) // Inject
  })
}

app.on('ready', () => {
  createWindow() // Initialize window
  const fileMenu = new Menu() // Create a submenu
  fileMenu.append(new MenuItem({
    label: 'Play/Pause',
    accelerator: 'MediaPlayPause',
    click: () => {
      console.log('MediaPlayPause')
      mainWindow.webContents.executeJavaScript('window.playPause()')
    }
  }))
  fileMenu.append(new MenuItem({
    label: 'Next Track',
    accelerator: 'MediaNextTrack',
    click: () => {
      mainWindow.webContents.executeJavaScript('window.skip()')
    }
  }))
  fileMenu.append(new MenuItem({
    label: 'Previous Track',
    accelerator: 'MediaPreviousTrack',
    click: () => {
      mainWindow.webContents.executeJavaScript('window.rewind()')
    }
  }))
  fileMenu.append(new MenuItem({
    label: 'Toggle Player Window',
    click: () => {
      if (playerIsShowing) mainWindow.hide()
      else mainWindow.show()
      playerIsShowing = !playerIsShowing
    }
  }))
  fileMenu.append(new MenuItem({
    label: 'Close',
    accelerator: 'CmdOrCtrl+Q',
    click: () => {
      playerIsQuiting = true
      mainWindow.close()
      app.quit()
    }
  }))

  // Add submenu to menu
  menu.append(new MenuItem({
    label: 'File',
    submenu: fileMenu
  }))

  // Create System Tray item
  let trayIcon = path.join(__dirname, 'icon.tray.png')
  let tray = new Tray(trayIcon)
  tray.setContextMenu(fileMenu)

  // Register our custom menu as the app's menu
  Menu.setApplicationMenu(menu)

  // Load shortcuts
  shorcutReigster(mainWindow)

  // Boot up Discord Rich Presence integration
  discordRPC()
})

// Close app if all windows closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

// Unregister all shortcuts if the app is done
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})