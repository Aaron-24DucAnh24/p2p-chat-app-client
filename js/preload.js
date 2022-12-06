
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appAPI', 
{
    getLoginInfo : (loginInfo) => ipcRenderer.send('getLoginInfo', loginInfo),
    logout       : ()          => ipcRenderer.send('logout'),
    openRegister : ()          => ipcRenderer.send('openRegister'),
    register     : (regInfo)   => ipcRenderer.send('register', regInfo),
    
    sendTextTrunk: (textTrunk) => ipcRenderer.send('sendTextTrunk', textTrunk),
    getTextTrunk : (callback)  => ipcRenderer.on('displayTextMessage', callback),

    sendImgTrunk : (imgTrunk)  => ipcRenderer.send('sendImgTrunk', imgTrunk),
    getImgTrunk  : (callback)  => ipcRenderer.on('displayImgMessage', callback),

    sendZipTrunk : (zipTrunk)  => ipcRenderer.send('sendZipTrunk', zipTrunk),
    getZipTrunk  : (callback)  => ipcRenderer.on('displayZipTrunk', callback),

    getIP        : (callback)  => ipcRenderer.on('getIP', callback),
    switchPeer   : (IP)        => ipcRenderer.send('switchPeer', IP)
 })