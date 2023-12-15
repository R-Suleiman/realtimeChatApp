const Messages = require('../models/Messages')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const createMessage = async (req, res) => {
  req.body.user = req.user.userId
  req.body.room = req.params.room
  const message = await Messages.create(req.body)
  res.status(StatusCodes.OK).json({ message })
}

const getMessages = async (req, res) => {
  const messages = await Messages.find({ room: req.params.room })
    .sort({ createdAt: 1 })
    .populate({
      path: 'user',
      select: 'username',
    })
  res.status(StatusCodes.OK).json({ messages, count: messages.length })
}

// FIX THIS BY UPDATING THE FLAG IN THE PROFILE
const clearChat = async (req, res) => {
  const { user: userId, body: msgDeleteFlag } = req

  const user = await Messages.findOneAndUpdate({ user: userId }, req.body, {
    new: true,
    runValidators: true,
  })

  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`)
  }
  res.status(StatusCodes.OK).json({ user })
}

const deleteMessage = async (req, res) => {
  const { id: messageId } = req.params
  const message = await Messages.findOneAndDelete({ _id: messageId })
  res.status(StatusCodes.OK).json({ message })
}

module.exports = {
  createMessage,
  getMessages,
  deleteMessage,
  clearChat,
}
