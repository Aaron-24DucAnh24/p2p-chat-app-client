
var logoutBtn = document.querySelector('.logout-btn')
var sendBtn   = document.querySelector('.send-btn')

var file      = document.querySelector('#file-input')
var msg       = document.querySelector('.msg')

var chatBox   = document.querySelector('.chat-messages')
var msgBox    = document.querySelector('.msg-container')
var fileBox   = document.querySelector('.file-note')

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
        window.appAPI.sendTextTrunk({name: 'test', text: msgValue})
        msg.value = ''
        msgValue  = ''
    }

    if(fileValue.length != 0) {

        /// zip message
        if(fileValue[0].type == 'application/zip') {
            chatBox.innerHTML = chatBox.innerHTML +
            `<div class="zip-message me">${fileValue[0].name}</div>`;
            var reader = new FileReader()
            reader.readAsDataURL(fileValue[0])
            reader.onload = function (e) {
                window.appAPI.sendZipTrunk({name: 'Test', zip: e.target.result})
            }
        }
        
        // img message
        else {
            var reader = new FileReader()
            reader.readAsDataURL(fileValue[0])
            reader.onload = function (e) {
                chatBox.innerHTML = chatBox.innerHTML +
                `<img src="${e.target.result}" class="img-message me"></img>`;
                window.appAPI.sendImgTrunk({name: 'Test', img: e.target.result})
            }
        }
        fileValue = []
        fileBox.innerHTML = 'No selected file'
    }

    msgBox.scrollTop = msgBox.scrollHeight
})

/// get text message handler ///
window.appAPI.getTextTrunk((event, textTrunk) => {
    chatBox.innerHTML = chatBox.innerHTML + 
    `<div class="message">
        <p class="meta">${textTrunk.name}</p>
        <p class="text">
            ${textTrunk.text}
        </p>
    </div>` ;
    msgBox.scrollTop = msgBox.scrollHeight
})

/// get img message handler /// 
window.appAPI.getImgTrunk((event, imgTrunk) => {
    chatBox.innerHTML = chatBox.innerHTML +
    `<img src="${imgTrunk.img}" class="img-message"></img>`;
})

/// get zip message handler /// 
window.appAPI.getZipTrunk((event, zipFile) => {
    console.log(zipFile)
})
