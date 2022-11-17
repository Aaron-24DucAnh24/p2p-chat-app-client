
/// for app creation ///
const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron
const window   = require('electron').BrowserWindow

/// for path controller ///
const path = require('path')

/// for calling API from server ///
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

/// for chat function ///
const {Server}  = require('socket.io')
const listener  = new Server(10000, "10.128.151.4")

const {io}      = require('socket.io-client')
var peerAddress = 'ws://localhost:10001'

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
    chatWindow.show()
    clearOtherWindows()

    listener.on('connection', (socket) => {
        socket.on('textTrunk', (textTrunk) => {
            chatWindow.webContents.send('displayTextMessage', textTrunk)
            console.log(textTrunk)
            socket.emit('event', textTrunk)
        })

        // console.log(socket)
        // socket.on('msg', (a) => {
        //     console.log(a)
        // })
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
    var length = window.getAllWindows().length
    if(length > 1) window.getAllWindows()[1].destroy()
}

///////////////////////////
/// listen from renderer //
///////////////////////////

ipcMain.on('openRegister', (e) => {
    createRegisterWindow()
})

ipcMain.on('logout', (e) => {
    createLoginWindow()
})

ipcMain.on('getLoginInfo', async (e, loginInfo) => {
    const response = await fetch('http://localhost:3000/login', {
        method: 'post',
        body: JSON.stringify(loginInfo),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    if(data) createChatWindow()
    else window.getFocusedWindow().reload()
})

ipcMain.on('register', async (e, reqInfo) => {
    const response = await fetch('http://localhost:3000/register', {
        method: 'post',
        body: JSON.stringify(reqInfo),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    if(data) createChatWindow()
    else window.getFocusedWindow().reload()
})

/// Send text trunk to other peers ///
ipcMain.on('sendTextTrunk', (e, textTrunk) => {
    var socket = io(peerAddress)
    socket.emit('textTrunk', textTrunk)
})
