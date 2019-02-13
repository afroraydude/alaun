const { app, BrowserWindow, globalShortcut, Menu, MenuItem, Tray } = require('electron')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const shorcutReigster = require('./shortcutRegister')
const discordRPC = require('./discordRPC')

let mainWindow

const menu = new Menu()

let playerIsShowing = false
let playerIsQuiting = false

function createWindow () {
  mainWindow = new BrowserWindow({ width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: false
    }
  })
  mainWindow.on('close', (event) => {
    mainWindow.hide()
    playerIsShowing = false
    event.returnValue = playerIsQuiting
  })

  /**
  mainWindow.onbeforeunload = (e) => {
    mainWindow.hide()
    playerIsShowing = false
    e.returnValue = playerIsQuiting
  }
  */
 
  mainWindow.loadURL('http://play.google.com/music/listen')

  if (process.env.isDev) mainWindow.webContents.openDevTools()

  playerIsShowing = true

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.once('dom-ready', () => {
    const inject = fs.readFileSync(path.join(__dirname, 'inject.js'), { encoding: 'utf8' })
    mainWindow.webContents.executeJavaScript(inject)
  })
}

app.on('ready', () => {
  const fileMenu = new Menu()
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
      app.quit()
    }
  }))
  menu.append(new MenuItem({
    label: 'File',
    submenu: fileMenu
  }))

  let trayIcon = path.join(__dirname, 'icon.tray.png')
  let tray = new Tray(trayIcon)
  tray.setContextMenu(fileMenu)

  Menu.setApplicationMenu(menu)
  createWindow()
  shorcutReigster(mainWindow)
  discordRPC()
})

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
