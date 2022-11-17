
var reqBtn = document.querySelector('.req-btn')

/// Register ///
reqBtn.addEventListener('click', (event) => {
    event.preventDefault()
    var name     = document.querySelector('#username').value
    var password = document.querySelector('#password').value
    var reqInfo = {name: name, password: password}
    console.log(reqInfo)

    window.appAPI.register(reqInfo)
})
