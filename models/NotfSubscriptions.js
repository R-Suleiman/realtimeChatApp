const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  subscription: { type: mongoose.Schema.Types.Mixed },
})

module.exports = mongoose.model('Subscriptions', subscriptionSchema)
