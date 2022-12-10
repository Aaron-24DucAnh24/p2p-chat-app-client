
var logoutBtn   = document.querySelector('.logout-btn')
var sendBtn     = document.querySelector('.send-btn')
var file        = document.querySelector('#file-input')
var msg         = document.querySelector('.msg')
var chatBox     = document.querySelector('.chat-messages')
var msgBox      = document.querySelector('.msg-container')
var fileBox     = document.querySelector('.file-note')
var friendList  = document.querySelector('.friend-list')
var emojis      = document.querySelectorAll('.emoji-item')
var curPeerName = ''

// log out
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault()
    window.appAPI.logout()
})

// get text message value
var msgValue  = ''
msg.oninput = () => {msgValue = msg.value}

// fill emoji to chat box
function fillEmoji(code) {
    msg.value += code
    msgValue = msg.value
}

// handle file box
var fileValue = []
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
        chatBox.innerHTML = chatBox.innerHTML + 
        `<div class="message message--me">
            <p class="meta">Me</p>
            <p class="text">
                ${msgValue}
            </p>
        </div>` ;
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
                chatBox.innerHTML = chatBox.innerHTML + 
                `<div class="me img-message">
                    <img src="${src}" class="img">
                    <a href="${src}" class="download-me clickable" download><i class="fa-solid fa-download"></i></a>
                </div>`;
                msgBox.scrollTop = msgBox.scrollHeight
                window.appAPI.sendImgTrunk({name: '', img: src})
            }
            fileValue = []
            fileBox.innerHTML = 'No selected file'
        }
        else {
            var reader = new FileReader()
            var name = fileValue[0].name
            reader.readAsDataURL(fileValue[0])
            reader.onload = function (e) {
                var src = e.target.result
                chatBox.innerHTML = chatBox.innerHTML + 
                `<div class="me file-message">
                    ${name}
                    <a href="${src} "class="download-me clickable" download><i class="fa-solid fa-download"></i></a>
                </div>`
                msgBox.scrollTop = msgBox.scrollHeight
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
    if(textTrunk.name == curPeerName) {
        chatBox.innerHTML = chatBox.innerHTML + 
        `<div class="message">
            <p class="meta">${textTrunk.name}</p>
            <p class="text">
                ${textTrunk.text}
            </p>
        </div>` ;
        msgBox.scrollTop = msgBox.scrollHeight
    }
})

// get img message handler
window.appAPI.getImgTrunk((event, imgTrunk) => {
    if(imgTrunk.name == curPeerName){
        chatBox.innerHTML = chatBox.innerHTML +
        `<div class="img-message">
            <img src="${imgTrunk.img}" class="img">
            <a href="${imgTrunk.img}"class="download clickable"><i class="fa-solid fa-download"></i></a>
        </div>`;
    }
    setTimeout(() => {msgBox.scrollTop = msgBox.scrollHeight},20);
})

// get file message handler
window.appAPI.getFileTrunk((event, fileTrunk) => {
    if(fileTrunk.name == curPeerName){
        chatBox.innerHTML = chatBox.innerHTML +
        `<div class="file-message">
            ${fileTrunk.fileName}
            <a href="${fileTrunk.file} "class="download clickable" download><i class="fa-solid fa-download"></i></a>
        </div>`;
    }
    setTimeout(() => {msgBox.scrollTop = msgBox.scrollHeight},20);
})

// Handle getting IP address and switching peers
var peerIPs
window.appAPI.getIP((event, IPs) => {
    var html = ''
    peerIPs = IPs

    for(var IP of IPs) {
        if(IP.name !== curPeerName)
            html += 
            `<li>
                <a class="friend" id="${IP.name}" onclick="switchPeer(this.id)">
                    ${IP.name}
                </a>
            </li>`
        else 
            html += 
            `<li>
                <a class="friend focused" id="${IP.name}" onclick="switchPeer(this.id)">
                    ${IP.name}
                </a>
            </li>`
    }
        
    if(html !== friendList.innerHTML){ 
        friendList.innerHTML = html
        html = ''
    }
})

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
        chatBox.innerHTML = ''
        document.querySelector('#' + Name).classList.add('focused')
    }
}
