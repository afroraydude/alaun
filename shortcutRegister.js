const { globalShortcut } = require('electron')

const registerShortcuts = (mainWindow) => {
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
}

module.exports = registerShortcuts
