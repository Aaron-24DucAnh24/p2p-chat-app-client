
// Necessary library
const path = require('path')
const {app, BrowserWindow, ipcMain} = require('electron')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const interfaces = require('os').networkInterfaces();


const server = 'http://127.0.0.1:3000' // Main server address
var userName = ''                      // Current user name
var IPs                                // List of ip address from server

// Chat: listen chanel
const {Server}  = require('socket.io')
const listener  = new Server(10000)

// Chat: send chanel
const {io}      = require('socket.io-client')
var peerAddress = ''

//////////////////
///main process///
//////////////////

app.whenReady().then(() => {
    createLoginWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) 
            createLoginWindow()
    })
})

app.on('window-all-closed', async () => {
    // logout before closing app
    if(userName) {
        await fetch(server + '/logout', {
            method: 'post',
            body: JSON.stringify({name: userName}),
            headers: {'Content-Type': 'application/json'}
        })
    }
    app.quit()
})

//////////////////
/// functions  ///
//////////////////

function createLoginWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Chatty.us',
        width: 1049,
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, '/public/js/preload.js'),
        },
    })
    mainWindow.loadFile(path.join(__dirname, '/view/index.html'))
    mainWindow.show()
    clearOtherWindows()
}

function createChatWindow() {
    const chatWindow = new BrowserWindow({
        title: 'Chatty.us',
        width: 1049,
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, '/public/js/preload.js'),
        },
    })
    chatWindow.loadFile(path.join(__dirname, '/view/app.html'))
    chatWindow.webContents.openDevTools()
    chatWindow.show()
    clearOtherWindows()

    // Listen to other peers
    listener.on('connection', (socket) => {

        // Get text trunk
        socket.on('textTrunk', (textTrunk) => {
            chatWindow.webContents.send('displayTextMessage', textTrunk)
        })

        // Get img trunk
        socket.on('imgTrunk', (imgTrunk) => {
            chatWindow.webContents.send('displayImgMessage', imgTrunk)
        })

        // Get zip trunk
        socket.on('zipTrunk', (zipTrunk) => {

        })
    })

    
    // request ip address from server
    async function requestIp() {
        var response = await fetch(server + '/' + userName);
        IPs      = await response.text()
        if(IPs) chatWindow.webContents.send('getIP', JSON.parse(IPs))
    }
    requestIp()
    setInterval(requestIp, 5000);
}

function createRegisterWindow() {
    const registerWindow = new BrowserWindow({
        title: 'Chatty.us',
        width: 1049,
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, '/public/js/preload.js'),
        },
    })
    registerWindow.loadFile(path.join(__dirname, '/view/register.html'))
    registerWindow.show()
    clearOtherWindows()
}

function clearOtherWindows() {
    var length = BrowserWindow.getAllWindows().length
    if(length > 1) BrowserWindow.getAllWindows()[1].destroy()
}

function getLocalAddress() {
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    return addresses[0]
}

///////////////////////////
/// listen to renderer   //
///////////////////////////

ipcMain.on('openRegister', () => {
    createRegisterWindow()
})

ipcMain.on('getLoginInfo', async (e, loginInfo) => {
    loginInfo.ip = getLocalAddress()
    const response = await fetch(server + '/login', {
        method: 'post',
        body: JSON.stringify(loginInfo),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json()
    if(data){
        createChatWindow()
        userName = data
    } 
    else BrowserWindow.getFocusedWindow().reload()
})

ipcMain.on('register', async (e, reqInfo) => {
    reqInfo.ip = getLocalAddress()
    const response = await fetch(server + '/register', {
        method: 'post',
        body: JSON.stringify(reqInfo),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json()
    if(data){
        createChatWindow()
        userName = data
        console.log(userName)
    } 
    else BrowserWindow.getFocusedWindow().reload()
})

ipcMain.on('logout', async (e) => {
    const response = await fetch(server + '/logout', {
        method: 'post',
        body: JSON.stringify({name: userName}),
        headers: {'Content-Type': 'application/json'}
    })
    const data = await response.json()
    if(data){
        createLoginWindow()
        userName = ''
    } 
    else BrowserWindow.getFocusedWindow().reload()
})

ipcMain.on('sendTextTrunk', (e, textTrunk) => {
    textTrunk.name = userName
    var socket = io(peerAddress)
    socket.emit('textTrunk', textTrunk)
})

ipcMain.on('sendImgTrunk', (e, imgTrunk) => {
    imgTrunk.name = userName
    var socket = io(peerAddress)
    socket.emit('imgTrunk', imgTrunk)
})

ipcMain.on('sendZipTrunk', (e, zipTrunk) => {
    zipTrunk.name = userName
    ///
})

ipcMain.on('switchPeer', (e, IP) => {
    peerAddress = 'http://' + IP + ':10000'
})
