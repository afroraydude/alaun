// Modules to control application life and create native browser window

// https://electronjs.org/docs/api/web-contents#contentsexecutejavascriptcode-usergesture-callback

const { app, BrowserWindow, globalShortcut, ipcMain, Menu, MenuItem, Notification } = require('electron')
const DiscordRPC = require('discord-rpc')
const path = require('path')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const clientId = '544286545440669734'

// only needed for discord allowing spectate, join, ask to join
DiscordRPC.register(clientId)

const rpc = new DiscordRPC.Client({ transport: 'ipc' })

const menu = new Menu()

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js')
    }
  })

  // and load the index.html of the app.
  //mainWindow.loadURL('https://play.google.com/music/listen')

  mainWindow.loadURL('http://play.google.com/music/listen')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  const inject = fs.readFileSync(path.join(__dirname, 'inject.js'), {encoding: 'utf8'})
  mainWindow.webContents.executeJavaScript(inject)

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

  // register global shortcuts
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

  // register local shortcuts
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
  Menu.setApplicationMenu(menu)
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
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
