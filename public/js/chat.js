
var logoutBtn   = document.querySelector('.logout-btn')
var sendBtn     = document.querySelector('.send-btn')
var file        = document.querySelector('#file-input')
var msg         = document.querySelector('.msg')
var chatBox     = document.querySelector('.chat-messages')
var msgBox      = document.querySelector('.msg-container')
var fileBox     = document.querySelector('.file-note')
var friendList  = document.querySelector('.friend-list')
var emojis      = document.querySelectorAll('.emoji-item')

var fileValue = []
var curPeerName = ''
var peerIPs
var msgValue  = ''

// log out
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault()
    peerMessages.clear()
    window.appAPI.logout()
})

// get text message value
msg.oninput = () => {msgValue = msg.value}

// fill emoji to chat box
function fillEmoji(code) {
    msg.value += code
    msgValue = msg.value
}

// handle file box
file.onchange = () => {
    fileValue = file.files
    if(fileValue.length == 0) {
        fileBox.innerHTML = 'No selected file'
    } else {
        fileBox.innerHTML = fileValue[0].name
    }
}

// handle getting IP address
var count = 0
window.appAPI.getIP((event, IPs) => {
    peerIPs = IPs

    if(!count) {
        for(var IP of IPs) {
            if(IP.ip) 
                friendList.innerHTML += `<li><a class="friend online" id="${IP.name}" onclick="switchPeer(this.id)">${IP.name}</a></li>`
            else
                friendList.innerHTML += `<li><a class="friend" id="${IP.name}" onclick="switchPeer(this.id)">${IP.name}</a></li>`
            
            if(!peerMessages.contain(IP.name)) 
                peerMessages.add({name: IP.name, html: ''})
        }
        switchPeer(IPs[0].name)
        count = 1
    } 

    else {
        for(var IP of IPs) {
            if(!peerMessages.contain(IP.name)) {
                peerMessages.add({name: IP.name, html: ''})
                friendList.innerHTML += `<li><a class="friend" id="${IP.name}" onclick="switchPeer(this.id)">${IP.name}</a></li>`
            }
            if(!IP.ip)
                document.querySelector('#' + IP.name).classList.remove('online')
            else if(!document.querySelector('#' + IP.name).classList.contains('online'))
                document.querySelector('#' + IP.name).classList.add('online')
        }
    }
})

// switching peers
function switchPeer(Name) {
    if(curPeerName !== Name) {
        if(curPeerName)
            document.querySelector('#' + curPeerName).classList.remove('focused')
        curPeerName = Name
        for(var peerIP of peerIPs) {
            if(peerIP.name === Name) {
                window.appAPI.switchPeer(peerIP.ip)
                break 
            }
        }
        chatBox.innerHTML = peerMessages.get(curPeerName)
        msgBox.scrollTop = msgBox.scrollHeight
        document.querySelector('#' + Name).classList.add('focused')
        document.querySelector('#' + Name).classList.remove('unread')
    }
}
