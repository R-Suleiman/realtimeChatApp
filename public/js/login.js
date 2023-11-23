const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const formDOM = document.querySelector('.loginForm')
const formMsg = document.querySelector('.form-msg')

formDOM.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = usernameInput.value
  const password = passwordInput.value

  try {
    const { data } = await axios.post('/api/v1/login', {
      username,
      password,
    })

    if (!data.user) {
      formMsg.innerHTML = `Invalid credentials`
    }

    usernameInput.value = ''
    passwordInput.value = ''

    // save the received token in local storage
    localStorage.setItem('token', data.token)
    window.location.href = '../room.html'
  } catch (error) {
    console.log(error)
    formMsg.computedStyleMap.color = 'red'
    formMsg.innerHTML = `An error has occured. Try again leter`
  }
})
