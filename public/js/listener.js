
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

    peerMessages.set(textTrunk.name, html)
    if(textTrunk.name != curPeerName)
        document.querySelector('#' + textTrunk.name).classList.add('unread')
})

// get img message handler
window.appAPI.getImgTrunk((event, imgTrunk) => {
    var html = 
        `<div class="img-message">
            <img src="${imgTrunk.img}" class="img">
            <a href="${imgTrunk.img}"class="download clickable" download><i class="fa-solid fa-download"></i></a>
        </div>`;

    if(imgTrunk.name == curPeerName) {
        chatBox.innerHTML += html
        setTimeout(() => {msgBox.scrollTop = msgBox.scrollHeight},20);
    }

    peerMessages.set(imgTrunk.name, html)
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

    peerMessages.set(fileTrunk.name, html)
    if(fileTrunk.name != curPeerName)
        document.querySelector('#' + fileTrunk.name).classList.add('unread')
})