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

const socket = io()

const initChat = async () => {
  await getUserProfile()

  // Join chatRoom
  socket.emit('joinRoom', { username, room })
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
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // Get message text
  const msg = e.target.elements.msg.value

  // Emit a message to the server
  socket.emit('chatMessage', msg)

  // clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

// Output message to DOM
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
