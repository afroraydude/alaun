const DiscordRPC = require('discord-rpc')
const { ipcMain } = require('electron')

let rpc

async function setActivity (state, details) {
  if (!rpc) {
    return
  }

  const startTimestamp = new Date()

  rpc.setActivity({
    details: details,
    state: state,
    startTimestamp,
    largeImageKey: 'default-icon',
    largeImageText: 'App Running',
    smallImageKey: (state === 'In song') ? 'play-button' : 'default-icon',
    smallImageText: 'App Running',
    instance: false
  })
}

const init = () => {
  const clientId = '544286545440669734'

  DiscordRPC.register(clientId)

  rpc = new DiscordRPC.Client({ transport: 'ipc' })

  rpc.on('ready', () => {
    setActivity('Idle', 'Nothing Playing')
  })
  
  rpc.login({ clientId }).catch(console.error)

  ipcMain.on('rpc-request', function (event, type, arg) {
    let title = arg.replace(' - Google Play Music', '')
    let titleSplit = title.split('-')
    if (titleSplit.length > 1) {
      setActivity('In song', title)
    } else setActivity('In menu')
  })  
}

module.exports = init
