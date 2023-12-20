const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  isSubscribed: { type: Boolean, default: false },
  subscription: { type: mongoose.Schema.Types.Mixed },
})

module.exports = mongoose.model('Subscriptions', subscriptionSchema)
