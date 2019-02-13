const { app, BrowserWindow, globalShortcut, ipcMain, Menu, MenuItem, Notification, Tray } = require('electron')
const DiscordRPC = require('discord-rpc')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

let mainWindow

const clientId = '544286545440669734'

DiscordRPC.register(clientId)

const rpc = new DiscordRPC.Client({ transport: 'ipc' })

const menu = new Menu()

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

  mainWindow.loadURL('http://play.google.com/music/listen')

  mainWindow.webContents.openDevTools()
  
  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.webContents.once('dom-ready', () => {
    const inject = fs.readFileSync(path.join(__dirname, 'inject.js'), {encoding: 'utf8'})
    mainWindow.webContents.executeJavaScript(inject)
  })
}

async function setActivity (state, details) {
  if (!rpc || !mainWindow) {
    return
  }

  const startTimestamp = new Date()

  rpc.setActivity({
    details: details,
    state: state,
    startTimestamp,
    largeImageKey: 'default-icon',
    largeImageText: 'App Running',
    smallImageKey: 'default-icon',
    smallImageText: 'App Running',
    instance: false
  })
}

rpc.on('ready', () => {
  setActivity('Idle', 'Nothing Playing')
})

rpc.login({ clientId }).catch(console.error)

app.on('ready', () => {
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.executeJavaScript('window.skip()')
  })
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.executeJavaScript('window.rewind()')
  })
  globalShortcut.register('MediaStop', () => {
    mainWindow.webContents.executeJavaScript('window.playPause()')
  })
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.executeJavaScript('window.playPause()')
  })
  
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
  menu.append(new MenuItem({
    label: 'File',
    submenu: fileMenu
  }))

  let trayIcon = path.join(__dirname, 'icon.tray.png')
  let tray = new Tray(trayIcon)
  tray.setContextMenu(fileMenu)

  Menu.setApplicationMenu(menu)
  createWindow()
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

ipcMain.on('rpc-request', function (event, type, arg) {
  let title = arg.replace(' - Google Play Music', '')
  let titleSplit = title.split('-')
  if (titleSplit.length > 1) {
    setActivity('In song', title)
    let notification = new Notification({ title: 'Alaun', body: title, silent: true })
    notification.show()
  } else setActivity('In menu')
})
