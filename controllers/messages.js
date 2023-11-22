const Messages = require('../models/Messages')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const createMessage = async (req, res) => {
  req.body.user = req.user.userId
  const message = await Messages.create(req.body)
  res.status(StatusCodes.OK).json({ message })
}

const getMessages = async (req, res) => {
  const messages = await Messages.find({ room: req.body.room })
    .sort({ createdAt: -1 })
    .populate({
      path: 'user',
      select: 'username',
    })
  res.status(StatusCodes.OK).json({ messages, count: messages.length })
}

// const clearChat = async(req, res) => {
//  const {
//   user: userId,
//  body: room
//  } = req

//  const messages = await Messages.deleteMany({user: userId, room})
//  res.status(StatusCodes.OK)
// }

// const deleteMessage = async (req, res) => {
//  const {id: messageId} = req.params
// }

module.exports = {
  createMessage,
  getMessages,
}
