const path = require('path')
const http = require('http')
const express = require('express')
require('express-async-errors')
require('dotenv').config()
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')

// connectDB
const connectDB = require('./db/connect')

// routes
const routes = require('./routes/routes')

// error-hanlers
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// middleware
const app = express()
const server = http.createServer(app)
const io = socketio(server)

//set static folder
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/api/v1', routes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const botName = 'ICT-Club'

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // welcome current user
    socket.emit(
      'message',
      formatMessage(
        botName,
        `Welcome to ${user.room} chat room. <br><br> Please note that, currently ALL messages sent or received in the chat will automatically disappear after 24 hrs`
      )
    )

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined a chat`)
      )

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // Listen for a chat mesage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      )

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    server.listen(PORT, console.log(`server is listening on port ${PORT}`))
  } catch (error) {
    console.log(error)
  }
}

start()
