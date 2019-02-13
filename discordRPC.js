// Import required scripts
const DiscordRPC = require('discord-rpc')
const { ipcMain } = require('electron')

let rpc

// Set Discord Rich Presence activity
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
    smallImageKey: (state === 'In song') ? 'play-button' : 'default-icon', // only use play button if song is playing
    smallImageText: 'App Running',
    instance: false
  })
}

// Startup Discord system
const init = () => {

  // Discord API client ID
  const clientId = '544286545440669734'

  // Intialize up Discord Rich Presence connection object
  DiscordRPC.register(clientId)
  rpc = new DiscordRPC.Client({ transport: 'ipc' })

  // When connected, set activity
  rpc.on('ready', () => {
    setActivity('Idle', 'Nothing Playing')
  })
  
  // Connect to local Discord instance
  rpc.login({ clientId }).catch(console.error)

  // Used for communication with the Browser Window
  ipcMain.on('rpc-request', function (event, type, arg) {
    let title = arg.replace(' - Google Play Music', '') // Remove 'Google Play Music' from title
    let titleSplit = title.split('-') // Get sections of new title
    if (titleSplit.length > 1) {
      setActivity('In song', title) // Show what song the user is playing
    } else setActivity('In menu') // Show that the user is between songs/not playing music
  })  
}

module.exports = init
