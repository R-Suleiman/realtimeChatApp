const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const formDOM = document.querySelector('.loginForm')
const formMsg = document.querySelector('.form-msg')

formDOM.addEventListener('submit', async (e) => {
  e.preventDefault()
  formMsg.style.color = 'white'
  formMsg.innerHTML = `Processing, please wait...`

  const username = usernameInput.value
  const password = passwordInput.value

  try {
    const { data } = await axios.post('/api/v1/login', {
      username,
      password,
    })

    if (!data.user) {
      formMsg.style.color = 'red'
      formMsg.innerHTML = `Invalid credentials`
    } else {
      usernameInput.value = ''
      passwordInput.value = ''

      // save the received token in local storage
      localStorage.setItem('token', data.token)
      window.location.href = '../room.html'
    }
  } catch (error) {
    console.log(error)
    formMsg.style.color = 'red'
    if (error.response && error.response.data.message) {
      const error2 = error.response.data.message
      formMsg.innerHTML = `<label style="font-weight: bold">${error2}</label>`
    } else {
      formMsg.innerHTML = error
      console.error('An error occurred:', error)
    }
  }
})
