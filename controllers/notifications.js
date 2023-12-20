const webPush = require('web-push')
const Subscriptions = require('../models/NotfSubscriptions')
const { BadRequestError, NotFoundError } = require('../errors')

webPush.setVapidDetails(
  'mailto:test@test.com',
  process.env.publicVapidKey,
  process.env.privateVapidKey
)

// subscribe route
const subscribe = async (req, res) => {
  req.body.user = req.user.userId
  let data

  try {
    // get all the subscriptions to verify to prevent duplicates
    const subscriptions = await Subscriptions.findOne({ user: req.user.userId })
    if (subscriptions) {
      data = await Subscriptions.findOneAndUpdate(
        {
          user: req.user.userId,
        },
        req.body
      )
    } else {
      // save the subscription to the database
      data = await Subscriptions.create(req.body)
    }
    if (!data) {
      throw new BadRequestError('Could not create a subscription')
    }
    res.status(201).json({ data })
  } catch (error) {
    console.log(error)
  }
}

const unsubscribe = async (req, res) => {
  const data = await Subscriptions.findOneAndDelete({ user: req.user.userId })

  if (!data) {
    throw new NotFoundError('Could not update. Data not found')
  }
  res.status(200).json({ data })
}

// send notification of a new messages to all the subscribed users
const sendNotification = async (req, res) => {
  req.body.user = req.user.userId
  req.body.room = req.params.id
  const { message, username } = req.body

  // fetch all the subscribed users to send the notification to
  const users = await Subscriptions.find({})

  if (!users) {
    throw new NotFoundError('No any users found')
  }

  // send a status
  res.status(201).json({ users })

  // create a payload
  const payload = JSON.stringify({
    title: `New message: ${req.params.id}`,
    message: message.message,
    user: username,
    room: req.params.id,
  })

  //pass push into the send notification and send it to all subscribers
  try {
    for (const user of users) {
      if (user.user.toString() === req.user.userId) {
        continue
      } else {
        webPush
          .sendNotification(user.subscription, payload)
          .catch((err) => console.error(err))
      }
    }
  } catch (error) {
    if (error.statusCode === 410) {
      console.log('Subscription has expired or unsubscribed')
    } else {
      console.log('error sending notification:', error)
    }
  }
}

module.exports = { subscribe, unsubscribe, sendNotification }
