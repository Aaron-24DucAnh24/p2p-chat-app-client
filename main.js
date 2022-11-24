
/// for app creation ///
const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron
const server   = 'https://9818-14-169-207-49.ap.ngrok.io'
var userName = ''

/// for path controller ///
const path = require('path')

/// for calling API from server ///
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

/// for chat function ///
const {Server}  = require('socket.io')
const listener  = new Server(10000)

const {io}      = require('socket.io-client')
var peerAddress = 'http://localhost:10001'

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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
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

    /// Listen to other peers ///
    listener.on('connection', (socket) => {

        /// Get text trunk
        socket.on('textTrunk', (textTrunk) => {
            chatWindow.webContents.send('displayTextMessage', textTrunk)
        })

        /// Get img trunk
        socket.on('imgTrunk', (imgTrunk) => {
            chatWindow.webContents.send('displayImgMessage', imgTrunk)
        })

        /// Get zip trunk
        socket.on('zipTrunk', (zipTrunk) => {
            ////
        })
    })
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
    winNo = 2
}

function clearOtherWindows() {
    var length = BrowserWindow.getAllWindows().length
    if(length > 1) BrowserWindow.getAllWindows()[1].destroy()
}

///////////////////////////
/// listen from renderer //
///////////////////////////

ipcMain.on('openRegister', () => {
    createRegisterWindow()
})

ipcMain.on('getLoginInfo', async (e, loginInfo) => {
    const response = await fetch(server + '/login', {
        method: 'post',
        body: JSON.stringify(loginInfo),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    if(data){
        createChatWindow()
        userName = data
        console.log(userName)
    } 
    else BrowserWindow.getFocusedWindow().reload()
})

ipcMain.on('register', async (e, reqInfo) => {
    const response = await fetch(server + '/register', {
        method: 'post',
        body: JSON.stringify(reqInfo),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
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
    });
    const data = await response.json();
    if(data){
        createLoginWindow()
        userName = ''
        console.log(userName)
    } 
    else BrowserWindow.getFocusedWindow().reload()
})

/// Send text trunk to other peers ///
ipcMain.on('sendTextTrunk', (e, textTrunk) => {
    var socket = io(peerAddress)
    socket.emit('textTrunk', textTrunk)
})

/// Send img trunk to other peers ///
ipcMain.on('sendImgTrunk', (e, imgTrunk) => {
    var socket = io(peerAddress)
    socket.emit('imgTrunk', imgTrunk)
})

/// Send zip trunk to other peers ///
ipcMain.on('sendZipTrunk', (e, zipTrunk) => {
    var socket = io(peerAddress)
    socket.emit('zipTrunk', zipTrunk)
})

/// Request IP from the server ///
ipcMain.on('requestIP', async (e) => {
    var response = await fetch(server + '/' + userName);
    var IPs      = await response.text()
    if(IPs) e.sender.send('getIP', JSON.parse(IPs))
})