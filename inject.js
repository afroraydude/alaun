var target = document.querySelector('title')

// create an observer instance
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    window.sendTitleUpdate(mutation.target.innerHTML)
  })
})

// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true }

// pass in the target node, as well as the observer options
observer.observe(target, config)

function PlayPause() {
  var button = document.getElementById('player-bar-play-pause')
  button.click()
}
function Rewind() {
  var button = document.getElementById('player-bar-rewind')
  button.click()
}

function Skip() {
  var button = document.getElementById('player-bar-forward')
  button.click()
}

window.playPause = PlayPause
window.rewind = Rewind
window.skip = Skip
