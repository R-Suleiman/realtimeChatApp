const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const msgLoader = document.querySelector('.msg-loader')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
const replyBlock = document.querySelector('.reply-block')
const contextMenu = document.getElementById('contextMenu')
const replyBtn = document.querySelector('.replyBtn')
const deleteBtn = document.querySelector('.deleteBtn')
const badgeCount = document.querySelector('.roomName')
let username
let userId
let msgCount
let replyFlag = {
  status: false,
  id: '',
}
let targetUser = {
  name: '',
  msg: '',
  id: null,
  msgBlock: null,
}

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

    const { username: newName, _id } = user
    username = newName
    userId = _id
    msgLoader.classList.add('hide')
  } catch (error) {
    msgLoader.classList.remove('hide')
    msgLoader.innerHTML = 'Error loading messages. Try again'
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
          div.dataset.id = msg._id
          div.dataset.userid = msg.user._id
          if (msg.user.username === username) {
            div.classList.add('sent')
          }

          // check if a message is a reply to another message :- has a replyTo propery and fetch that replied message
          let repliedMsg
          if (msg.replyTo) {
            repliedMsg = messages.filter((filter) => filter._id === msg.replyTo)
          }

          div.innerHTML = `${
            repliedMsg && repliedMsg.length > 0
              ? `<p class='repliedText' style='background-color: ${
                  userId === msg.user._id ? '#083518' : 'rgb(45, 51, 51)'
                }'><label style='color: ${
                  repliedMsg[0].user.username === username
                    ? 'rgb(28, 209, 28)'
                    : 'orange'
                }'>${
                  repliedMsg[0].user.username === username
                    ? 'you'
                    : repliedMsg[0].user.username
                }</label> <br> <label>${truncateString(
                  repliedMsg[0].message
                )}</label> </p> <br>`
              : ''
          }  <p class="meta context" data-id='${msg._id}' data-userid='${
            msg.user._id
          }'>${msg.user.username} <span>${time}</span></p>
            <p class="text context" data-id='${msg._id}' data-userid='${
            msg.user._id
          }'>
            ${msg.message}
            </p>`
          return div.outerHTML
        })
        .join('')

      document.querySelector('.chat-messages').innerHTML += msgList
    }
    msgCount = count
    badgeCount.innerHTML = `${room} - ${count} messages`
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

//bot message from server
socket.on('bot-message', (message) => {
  outputBotMessage(message)
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
  msgLoader.textContent = 'sending...'
  msgLoader.classList.remove('hide')
  const token = localStorage.getItem('token')
  let resultMessage

  // Get message text
  const msg = e.target.elements.msg.value

  // make an API call to save the message to the DB
  try {
    if (replyFlag.status === false) {
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
      if (message) {
        resultMessage = message
        // Emit a message to the server
        socket.emit('chatMessage', message)
      }
    } else {
      // add a route to reply message with a replyto property
      const {
        data: { message },
      } = await axios.post(
        `/api/v1/messages/${room}`,
        {
          message: msg,
          replyId: replyFlag.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (message) {
        resultMessage = message
        // Emit a message to the server
        socket.emit('chatMessage', message)
      }
    }

    msgLoader.classList.add('hide')
    // send a notification to the server
    const response = await axios.post(
      `/api/v1/notification/${resultMessage.room}`,
      { resultMessage, username },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response) {
      // clear input
      e.target.elements.msg.value = ''
      e.target.elements.msg.focus()
      hideReplyBlock()
    }

    // increase the message count
    badgeCount.innerHTML = `${room} - ${++msgCount} messages`
  } catch (error) {
    console.log(error)
  }
})

// event to delete a message

const deleteMessage = async (msgId) => {
  const isConfirmed = window.confirm('Delete message?')
  if (isConfirmed) {
    const token = localStorage.getItem('token')
    msgLoader.textContent = 'deleting...'
    msgLoader.classList.remove('hide')

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
        msgLoader.classList.add('hide')
        // increase the message count
        badgeCount.innerHTML = `${room} - ${--msgCount} messages`
        return true
      }
    } catch (error) {
      console.log(error)
    }
  }
}
// output bot message
function outputBotMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
            ${message.text}
            </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// Output message to DOM

async function outputMessage(message) {
  const msgUserId = message.text.user
  const time = formatTime(message.text.createdAt)
  const div = document.createElement('div')
  div.classList.add('message')
  if (message.username === username) {
    div.classList.add('sent')
  }
  div.dataset.id = message.text._id
  div.dataset.userid = message.text.user
  let repliedMsg
  if (message.text.replyTo) {
    // make a server request to return the replied text
    msgLoader.textContent = 'sending...'
    msgLoader.classList.remove('hide')
    const token = localStorage.getItem('token')

    try {
      const {
        data: { userMsg },
      } = await axios.get(`/api/v1/message/${message.text.replyTo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      repliedMsg = userMsg
      msgLoader.classList.add('hide')
    } catch (error) {
      console.log(error)
    }
  }
  div.innerHTML = `${
    repliedMsg
      ? `<p class='repliedText' style='background-color: ${
          userId === message.text.user ? '#083518' : 'rgb(45, 51, 51)'
        }'><label style='color: ${
          repliedMsg.user.username === username ? 'rgb(28, 209, 28)' : 'orange'
        }'>${
          repliedMsg.user.username === username
            ? 'you'
            : repliedMsg.user.username
        }</label> <br> <label>${truncateString(
          repliedMsg.message
        )}</label> </p> <br>`
      : ''
  }
    <p class="meta context" data-id='${message.text._id}' data-userid='${
    message.text.user
  }'>${message.username} <span>${time}</span></p>
            <p class="text context" data-id='${
              message.text._id
            }' data-userid='${message.text.user}'>
            ${message.text.message}
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

// Function to extract name and userMsg
function getNameAndUserMsg(el) {
  let name, userMsg
  let currentElement = el.parentElement

  if (!currentElement.classList.contains('message')) {
    name = el.querySelector('.meta')?.innerText || null
    userMsg = el.querySelector('.text')?.innerText || null
  } else {
    if (el.classList.contains('text')) {
      userMsg = el.innerText
      name = currentElement.querySelector('.meta')?.innerText || null
    } else if (el.classList.contains('meta')) {
      name = el.innerText
      userMsg = currentElement.querySelector('.text')?.innerText || null
    }
  }

  return { name, userMsg }
}

// displaying context menu
document
  .querySelector('.chat-messages')
  .addEventListener('contextmenu', (e) => {
    e.preventDefault()
    const el = e.target

    if (el.classList.contains('message') || el.classList.contains('context')) {
      // show the custom context menu

      // check if the user should delete the message or not by looking if he/she is the sender
      if (el.dataset.userid !== userId) {
        deleteBtn.style.display = 'none'
      } else {
        deleteBtn.style.display = 'block'
      }

      contextMenu.style.display = 'block'
      contextMenu.style.left = `${e.pageX}px`
      contextMenu.style.top = `${e.pageY}px`

      const { name, userMsg } = getNameAndUserMsg(el)
      targetUser.name = name
      targetUser.msg = userMsg
      targetUser.id = el.dataset.id
      targetUser.msgBlock = el

      // hide context menu when clicking out of it
      document.addEventListener('click', hideContextMenu)
    }
  })

// handle reply functionality
replyBtn.addEventListener('click', () => {
  replyBlock.style.display = 'block'
  replyBlock.innerHTML = `<p> Replying to <b> ${
    targetUser.name.split(' ')[0]
  } </b> <br> ${truncateString(
    targetUser.msg
  )} <span style="float: right" onclick="hideReplyBlock()"><i class="fas fa-times"></i> </span></p> `
  document.getElementById('msg').focus()
  replyFlag.status = true
  replyFlag.id = targetUser.id

  // restoring values to default
  targetUser = {
    name: '',
    msg: '',
    id: null,
    msgBlock: null,
  }

  // hide context menu
  hideContextMenu()
})

// handle delete functionality
deleteBtn.addEventListener('click', async () => {
  const value = await deleteMessage(targetUser.id)
  if (value === true) {
    let currentElement = targetUser.msgBlock
    while (currentElement && !currentElement.classList.contains('message')) {
      currentElement = currentElement.parentElement
    }
    currentElement.classList.add('hide')

    // restoring values to default
    targetUser = {
      name: '',
      msg: '',
      id: null,
      msgBlock: null,
    }
  }

  // hide context menu
  hideContextMenu()
})

const hideContextMenu = () => {
  contextMenu.style.display = 'none'
  document.removeEventListener('click', hideContextMenu)
}

const truncateString = (inputString) => {
  const wordsArray = inputString.split(' ') // Split the string by space
  if (wordsArray.length > 7) {
    const truncatedString = wordsArray.slice(0, wordsCount).join(' ') // Take the first few words and join them
    const isTruncated = wordsArray.length > wordsCount // Check if the string was truncated

    return isTruncated ? truncatedString + '...' : inputString
  } else {
    return inputString
  }
}

const hideReplyBlock = () => {
  replyBlock.style.display = 'none'
  replyFlag.status = false
  replyFlag.id = ''
}
