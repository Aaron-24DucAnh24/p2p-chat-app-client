
// send message handler
sendBtn.addEventListener('click', async (event) => {
    event.preventDefault()

    // text message
    if(msgValue) {
        var html = `<div class="message message--me"><p class="meta">Me</p><p class="text">${msgValue}</p></div>`
        chatBox.innerHTML += html
        peerMessages.set(curPeerName, html)
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
                peerMessages.set(curPeerName, html)
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
                peerMessages.set(curPeerName, html)
                window.appAPI.sendFileTrunk({name: '', fileName: name, file: src})
            }
            fileValue = []
            fileBox.innerHTML = 'No selected file'
        }
    }

    setTimeout(()=>{msgBox.scrollTop=msgBox.scrollHeight},100)
})