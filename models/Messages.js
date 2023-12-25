const mongoose = require('mongoose')

const messagesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pleade provide user'],
    },
    message: {
      type: String,
    },
    room: {
      type: String,
    },
    replyTo: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Messages', messagesSchema)
