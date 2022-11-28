
var logoutBtn = document.querySelector('.logout-btn')
var sendBtn   = document.querySelector('.send-btn')

var file      = document.querySelector('#file-input')
var msg       = document.querySelector('.msg')

var chatBox   = document.querySelector('.chat-messages')
var msgBox    = document.querySelector('.msg-container')
var fileBox   = document.querySelector('.file-note')

var curPeerName = 'Aaron'

/// Logout ///
logoutBtn.addEventListener('click', (event) => {
    event.preventDefault()
    window.appAPI.logout()
})

/// Get text message value ///
msg.oninput = () => {msgValue = msg.value}
var msgValue  = ''


/// Handle file box
var fileValue = []
file.onchange = () => {
    fileValue = file.files
    if(fileValue.length == 0) {
        fileBox.innerHTML = 'No selected file'
    } else {
        fileBox.innerHTML = fileValue[0].name
    }
}

/// Send message handler ///
sendBtn.addEventListener('click', (event) => {
    event.preventDefault()

    /// text message
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

        /// zip message
        if(fileValue[0].type == 'application/zip') {
            chatBox.innerHTML = chatBox.innerHTML +
            `<div class="zip-message me">${fileValue[0].name}</div>`;
            ///
        }
        
        // img message
        else {
            var reader = new FileReader()
            reader.readAsDataURL(fileValue[0])
            reader.onload = function (e) {
                chatBox.innerHTML = chatBox.innerHTML +
                `<img src="${e.target.result}" class="img-message me"></img>`;
                window.appAPI.sendImgTrunk({name: '', img: e.target.result})
            }
        }
        fileValue = []
        fileBox.innerHTML = 'No selected file'
    }

    msgBox.scrollTop = msgBox.scrollHeight
})

/// get text message handler ///
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

/// get img message handler /// 
window.appAPI.getImgTrunk((event, imgTrunk) => {
    if(imgTrunk.name == curPeerName){
        chatBox.innerHTML = chatBox.innerHTML +
        `<img src="${imgTrunk.img}" class="img-message"></img>`;
    }
})

/// get zip message handler /// 
window.appAPI.getZipTrunk((event, zipFile) => {
    ///
})

/// Handle getting IP address ///
/// and redirecting peers ///

var friendList = document.querySelector('.friend-list')
var rendererIPs

window.appAPI.getIP((event, IPs) => {
    var html = ''
    rendererIPs = IPs
    for(var IP of IPs) {
        if(IP.name != curPeerName)
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
    if(html != friendList.innerHTML)
        friendList.innerHTML = html
})

function switchPeer(Name) {
    if(curPeerName !== Name) {
        if(curPeerName)
            document.querySelector('#' + curPeerName).classList.remove('focused')
        curPeerName = Name
        for(var rendererIP of rendererIPs) {
            if(rendererIP.name === Name) {
                window.appAPI.switchPeer(rendererIP.ip)
                break 
            }
        }
        chatBox.innerHTML = ''
        var peer = document.querySelector('#' + Name)
        peer.classList.add('focused')
    }
}
