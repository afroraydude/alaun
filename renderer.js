const { ipcRenderer } = require('electron')

function sendTitleUpdate (title) {
  ipcRenderer.send('rpc-request', 'rpc', title)
}

window.sendTitleUpdate = sendTitleUpdate
