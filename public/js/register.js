const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const cPasswordInput = document.getElementById('cPassword')
const formDOM = document.querySelector('.registerForm')
const formMsg = document.querySelector('.form-msg')

formDOM.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = usernameInput.value
  const password = passwordInput.value
  const cPassword = cPasswordInput.value
  const msgDeleteFlag = [
    {
      programming: false,
      graphicDesign: false,
      networkAndSecurity: false,
      computerMaintenance: false,
    },
  ]

  if (password !== cPassword) {
    e.preventDefault()
    formMsg.style.color = 'red'
    formMsg.innerHTML = 'Passwords do not match'
  } else {
    try {
      const { data } = await axios.post('/api/v1/register', {
        username,
        password,
        msgDeleteFlag,
      })

      usernameInput.value = ''
      passwordInput.value = ''
      cPasswordInput.value = ''

      // save the received token in local storage
      localStorage.setItem('token', data.token)
      window.location.href = '../index.html'
    } catch (error) {
      console.log(error)
      formMsg.computedStyleMap.color = 'red'
      formMsg.innerHTML = `An error has occured. Try again leter`
    }
  }
})
