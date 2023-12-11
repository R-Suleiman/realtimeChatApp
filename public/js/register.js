const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const cPasswordInput = document.getElementById('cPassword')
const formDOM = document.querySelector('.registerForm')
const formMsg = document.querySelector('.form-msg')
const nameError = document.querySelector('.nameError')
const passwordError = document.querySelector('.passwordError')
const cPasswordError = document.querySelector('.cPasswordError')

usernameInput.addEventListener('input', function () {
  if (this.value.length < 3 && this.value !== '') {
    nameError.style.color = 'red'
    nameError.innerHTML = 'Name too short. Must be at least 3 characters long'
  } else {
    nameError.innerHTML = ''
  }
})

passwordInput.addEventListener('input', function () {
  const passwordFormat =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  if (!passwordFormat.test(this.value) && this.value !== '') {
    passwordError.style.color = 'red'
    passwordError.innerHTML =
      'Password must be strong: at least 8 characters, including upper and lower case letters, numbers, and special characters'
  } else {
    passwordError.innerHTML = ''
  }
})

cPasswordInput.addEventListener('input', function () {
  const password = passwordInput.value

  if (password !== this.value && this.value !== '') {
    cPasswordError.style.color = 'red'
    cPasswordError.innerHTML = 'Password do not match'
  } else {
    cPasswordError.innerHTML = ''
  }
})

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

  if (username.length < 3 && username !== '') {
    nameError.style.color = 'red'
    nameError.innerHTML = 'Name too short. Must be at least 3 characters long'
    e.preventDefault()
  } else {
    const passwordFormat =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordFormat.test(password) && password !== '') {
      passwordError.style.color = 'red'
      passwordError.innerHTML =
        'Password must be strong: at least 8 characters, including upper and lower case letters, numbers, and special characters'
      e.preventDefault()
    } else {
      if (password !== cPassword && cPassword !== '') {
        cPasswordError.style.color = 'red'
        cPasswordError.innerHTML = 'Password do not match'
        e.preventDefault()
      } else {
        formMsg.style.color = 'white'
        formMsg.innerHTML = `Processing, please wait...`
        try {
          const { data } = await axios.post('/api/v1/register', {
            username,
            password,
            msgDeleteFlag,
          })

          usernameInput.value = ''
          passwordInput.value = ''
          cPasswordInput.value = ''

          formMsg.innerHTML = ``
          // save the received token in local storage
          localStorage.setItem('token', data.token)
          window.location.href = '../index.html'
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
      }
    }
  }
})
