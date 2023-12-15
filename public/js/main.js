const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const msgLoader = document.querySelector('.msg-loader')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
let username

// Get username and room from URL
const { room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

// get the profile of the user, specifically the name
const getUserProfile = async () => {
  msgLoader.classList.remove('hide')
  const token = localStorage.getItem('token')
  try {
    const {
      data: { user },
    } = await axios.get('/api/v1/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const { username: newName } = user
    username = newName
    msgLoader.classList.add('hide')
  } catch (error) {
    console.log(error)
  }
}

// get messages record from the DB for a specific room
const getMessages = async (req, res) => {
  msgLoader.classList.remove('hide')
  const token = localStorage.getItem('token')

  try {
    const {
      data: { messages, count },
    } = await axios.get(`/api/v1/messages/${room}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (messages) {
      const msgList = messages
        .map((msg) => {
          const time = formatTime(msg.createdAt)
          const div = document.createElement('div')
          div.classList.add('message')
          div.innerHTML = `<p class="meta">${msg.user.username} <span>${time}</span></p>
            <p class="text">
            ${msg.message}
            </p>`
          return div.outerHTML
        })
        .join('')

      document.querySelector('.chat-messages').innerHTML += msgList
    }
    document.querySelector(
      '.roomName'
    ).innerHTML = `${room} - ${count} messages`
    msgLoader.classList.add('hide')
  } catch (error) {
    msgLoader.classList.add('hide')
    console.log(error)
  }
}

const socket = io()

const initChat = async () => {
  await getUserProfile()

  // Join chatRoom
  socket.emit('joinRoom', { username, room })

  // fetch message history
  await getMessages()
}
initChat()

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

// message from server
socket.on('message', (message) => {
  outputMessage(message)

  // scrol down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// Message submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const token = localStorage.getItem('token')

  // Get message text
  const msg = e.target.elements.msg.value

  // Emit a message to the server
  socket.emit('chatMessage', msg)

  // make an API call to save the message to the DB
  try {
    const {
      data: { message },
    } = await axios.post(
      `/api/v1/messages/${room}`,
      {
        message: msg,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  } catch (error) {
    console.log(error)
  }

  // clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

// event to delete a message
async function confirmDelete(msgId) {
  const isConfirmed = window.confirm('Delete message?')
  if (isConfirmed) {
    const token = localStorage.getItem('token')

    try {
      const {
        data: { message },
      } = await axios.delete(`/api/v1/messages/${msgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // window.location.reload(true)

      if (message) {
        window.location.reload()
      }
      // window.location.href = window.location.href
    } catch (error) {
      console.log(error)
    }
  }
}

// Output message to DOM

//<span style="float: right; color: red"><i class="fa fa-trash deleteMsg" data-id='${msg._id}' onclick='confirmDelete('${message._id}')'></i></span>

function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
            ${message.text}
            </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM
const outputRoomName = (room) => {
  roomName.innerText = room
}

// add users to DOM
const outputUsers = (users) => {
  userList.innerHTML = `
 ${users.map((user) => `<li>${user.username}</li>`).join('')}
 `
}

// format time
const formatTime = (time) => {
  const dateObject = new Date(time)

  const timeString = dateObject.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return timeString
}
