
class PeerMessages {
    constructor() {
        this.peerMsgs = []
    }
    
    contain(peerName) {
        for(var peerMsg of this.peerMsgs)
            if(peerMsg.name === peerName)
                return true
        return false
    }
    
    set(peerName, html) {
        for(var peerMsg of this.peerMsgs)
            if(peerMsg.name === peerName)
                peerMsg.html += html
    }
    
    get(peerName) {
        for(var peerMsg of this.peerMsgs)
            if(peerMsg.name == peerName)
                return peerMsg.html
    }

    add(newObj) {
        this.peerMsgs.push(newObj)
    }

    clear() {
        this.peerMsgs =[]
    }
}

const peerMessages = new PeerMessages()
