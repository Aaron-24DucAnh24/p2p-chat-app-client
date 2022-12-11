
var logoutBtn   = document.querySelector('.logout-btn')
var sendBtn     = document.querySelector('.send-btn')
var file        = document.querySelector('#file-input')
var msg         = document.querySelector('.msg')
var chatBox     = document.querySelector('.chat-messages')
var msgBox      = document.querySelector('.msg-container')
var fileBox     = document.querySelector('.file-note')
var friendList  = document.querySelector('.friend-list')
var emojis      = document.querySelectorAll('.emoji-item')
var msgValue  = ''
var fileValue = []
var curPeerName = ''
var peerIPs
var peerMsgs = []

// log out
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault()
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

// send message handler
sendBtn.addEventListener('click', async (event) => {
    event.preventDefault()

    // text message
    if(msgValue) {
        var html = `<div class="message message--me"><p class="meta">Me</p><p class="text">${msgValue}</p></div>`
        chatBox.innerHTML += html
        setPeerMsg(curPeerName, html)
        window.appAPI.sendTextTrunk({name: '', text: msgValue})
        msg.value = ''
        msgValue  = ''
    }

    if(fileValue.length != 0) {

        // img message
        if(fileValue[0].type.includes("image")){
            var reader = new FileReader()
            reader.readAsDataURL(fileValue[0])
            reader.onload = function (e) {
                var src = e.target.result
                var html = `<div class="me img-message"><img src="${src}" class="img"><a href="${src}" class="download-me clickable" download><i class="fa-solid fa-download"></i></a></div>`
                chatBox.innerHTML += html
                setPeerMsg(curPeerName, html)
                window.appAPI.sendImgTrunk({name: '', img: src})
            }
            fileValue = []
            fileBox.innerHTML = 'No selected file'
        }

        // other files message
        else {
            var reader = new FileReader()
            var name = fileValue[0].name
            reader.readAsDataURL(fileValue[0])
            reader.onload = function (e) {
                var src = e.target.result
                var html = `<div class="me file-message">${name}<a href="${src} "class="download-me clickable" download><i class="fa-solid fa-download"></i></a></div>`
                chatBox.innerHTML += html
                setPeerMsg(curPeerName, html)
                window.appAPI.sendFileTrunk({name: '', fileName: name, file: src})
            }
            fileValue = []
            fileBox.innerHTML = 'No selected file'
        }
    }

    setTimeout(()=>{msgBox.scrollTop=msgBox.scrollHeight},100)
})

// get text message handler
window.appAPI.getTextTrunk((event, textTrunk) => {
    var html = 
        `<div class="message">
            <p class="meta">${textTrunk.name}</p>
            <p class="text">${textTrunk.text}</p>
        </div>`;

    if(textTrunk.name == curPeerName) {
        chatBox.innerHTML += html
        msgBox.scrollTop = msgBox.scrollHeight
    }

    setPeerMsg(textTrunk.name, html)
    if(textTrunk.name != curPeerName)
        document.querySelector('#' + textTrunk.name).classList.add('unread')
})

// get img message handler
window.appAPI.getImgTrunk((event, imgTrunk) => {
    var html = 
        `<div class="img-message">
            <img src="${imgTrunk.img}" class="img">
            <a href="${imgTrunk.img}"class="download clickable"><i class="fa-solid fa-download"></i></a>
        </div>`;

    if(imgTrunk.name == curPeerName) {
        chatBox.innerHTML += html
        setTimeout(() => {msgBox.scrollTop = msgBox.scrollHeight},20);
    }

    setPeerMsg(imgTrunk.name, html)
    if(imgTrunk.name != curPeerName)
        document.querySelector('#' + imgTrunk.name).classList.add('unread')
})

// get file message handler
window.appAPI.getFileTrunk((event, fileTrunk) => {
    var html = 
        `<div class="file-message"> ${fileTrunk.fileName}
            <a href="${fileTrunk.file} "class="download clickable" download><i class="fa-solid fa-download"></i></a>
        </div>`;

    if(fileTrunk.name == curPeerName) {
        chatBox.innerHTML += html
        setTimeout(() => {msgBox.scrollTop = msgBox.scrollHeight},20);
    }

    setPeerMsg(fileTrunk.name, html)
    if(fileTrunk.name != curPeerName)
        document.querySelector('#' + fileTrunk.name).classList.add('unread')
})

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
            if(!containPeer(IP.name)) peerMsgs.push({name: IP.name, html: ''})
        }
        switchPeer(IPs[0].name)
        count = 1
    } 

    else {
        for(var IP of IPs) {
            if(!containPeer(IP.name)) {
                peerMsgs.push({name: IP.name, html: ''})
                friendList.innerHTML += `<li><a class="friend" id="${IP.name}" onclick="switchPeer(this.id)">${IP.name}</a></li>`
            }
            if(!IP.ip)
                document.querySelector('#' + IP.name).classList.remove('online')
            else if(!document.querySelector('#' + IP.name).classList.contains('online'))
                document.querySelector('#' + IP.name).classList.add('online')
        }
    }
})

function containPeer(peerName) {
    for(var peerMsg of peerMsgs)
        if(peerMsg.name === peerName)
            return true
    return false
}

function setPeerMsg(peerName, html) {
    for(var peerMsg of peerMsgs)
        if(peerMsg.name === peerName)
            peerMsg.html += html
}

function getPeerMsg(peerName) {
    for(var peerMsg of peerMsgs)
        if(peerMsg.name == peerName)
            return peerMsg.html
}

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
        chatBox.innerHTML = getPeerMsg(curPeerName)
        msgBox.scrollTop = msgBox.scrollHeight
        document.querySelector('#' + Name).classList.add('focused')
        document.querySelector('#' + Name).classList.remove('unread')
    }
}
