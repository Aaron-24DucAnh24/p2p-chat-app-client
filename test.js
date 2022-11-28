const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron
const path = require('path')


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

module.exports = {createLoginWindow}