
// Necessary library
const path = require('path')
const {app, BrowserWindow, ipcMain} = require('electron')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const interfaces = require('os').networkInterfaces();

const server = 'https://c0c9-113-176-62-181.ap.ngrok.io'
var userName = ''                      // Current user name
var IPs                                // List of ip address from server

// Chat: listen chanel
const {Server}  = require('socket.io')
const listener  = new Server(10000, {maxHttpBufferSize: 1e8})

// Chat: send chanel
const {io}      = require('socket.io-client');
var peerAddress = ''

//////////////////
///main process///
//////////////////

app.whenReady().then(() => {
    createLoginWindow()
})

app.on('window-all-closed', closeApp)

//////////////////
/// functions  ///
//////////////////

function createLoginWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Chatty.us',
        width: 1049,
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, '/preload.js'),
        },
    })
    mainWindow.loadFile(path.join(__dirname, '/public/view/login.html'))
    clearOtherWindows()
    mainWindow.show()
    mainWindow.on('closed', closeApp)
}

function createChatWindow() {
    const chatWindow = new BrowserWindow({
        title: 'Chatty.us',
        width: 1049,
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, '/preload.js'),
        },
    })
    chatWindow.loadFile(path.join(__dirname, '/public/view/chat.html'))
    clearOtherWindows()
    chatWindow.show()
    chatWindow.on('closed', closeApp)

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

        // Get file trunk
        socket.on('fileTrunk', (fileTrunk) => {
            chatWindow.webContents.send('displayFileMessage', fileTrunk)
        })
    })

    // request ip address from server
    async function requestIp() {
        var response = await fetch(server + '/' + userName);
        IPs      = await response.text()
        if(IPs) chatWindow.webContents.send('getIP', JSON.parse(IPs))
    }
    requestIp()
    setInterval(requestIp, 2000);
}

function createRegisterWindow() {
    const registerWindow = new BrowserWindow({
        title: 'Chatty.us',
        width: 1049,
        height: 675,
        webPreferences: {
            preload: path.join(__dirname, '/preload.js'),
        },
    })
    registerWindow.loadFile(path.join(__dirname, '/public/view/register.html'))
    clearOtherWindows()
    registerWindow.show()
    registerWindow.on('closed', closeApp)
}

function clearOtherWindows() {
    for(var window of BrowserWindow.getAllWindows())
        window.hide()
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

async function closeApp() {
    // logout before closing app
    if(userName) {
        await fetch(server + '/logout', {
            method: 'post',
            body: JSON.stringify({name: userName}),
            headers: {'Content-Type': 'application/json'}
        })
    }
    app.quit()
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

ipcMain.on('sendFileTrunk', (e, fileTrunk) => {
    fileTrunk.name = userName
    var socket = io(peerAddress)
    socket.emit('fileTrunk', fileTrunk)
})

ipcMain.on('switchPeer', (e, IP) => {
    peerAddress = 'http://' + IP + ':10000'
})
