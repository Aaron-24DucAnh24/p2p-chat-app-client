
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appAPI', 
{
    getLoginInfo : (loginInfo) => ipcRenderer.send('getLoginInfo', loginInfo),
    logout       : ()          => ipcRenderer.send('logout'),
    openRegister : ()          => ipcRenderer.send('openRegister'),
    register     : (regInfo)   => ipcRenderer.send('register', regInfo),
    sendTextTrunk: (textTrunk) => ipcRenderer.send('sendTextTrunk', textTrunk),
    getTextTrunk : (callback)  => ipcRenderer.on('displayTextMessage', callback),
})