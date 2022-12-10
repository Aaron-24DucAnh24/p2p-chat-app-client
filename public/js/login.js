
var btn = document.querySelector('.btn')
var reqBtn = document.querySelector('.new-account')

// Login
btn.addEventListener('click', (event) => {
    event.preventDefault()
    var name     = document.querySelector('#username').value
    var password = document.querySelector('#password').value
    var loginInfo = {name: name, password: password}
    window.appAPI.getLoginInfo(loginInfo)
})

// Open register window
reqBtn.addEventListener('click', (event) => {
    event.preventDefault()
    window.appAPI.openRegister()
})
