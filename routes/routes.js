const express = require('express')
const router = express.Router()

const userAuthentication = require('../middleware/authentication')
const { register, login, getUser } = require('../controllers/auth')
const {
  createMessage,
  getMessages,
  getMessage,
  deleteMessage,
  clearChat,
} = require('../controllers/messages')
const {
  subscribe,
  unsubscribe,
  sendNotification,
} = require('../controllers/notifications')

router.route('/register').post(register)
router.route('/login').post(login)
router
  .route('/messages/:room')
  .post(userAuthentication, createMessage)
  .get(userAuthentication, getMessages)
  .patch(userAuthentication, clearChat)
router.route('/messages/:id').delete(userAuthentication, deleteMessage)
router.route('/message/:id').get(userAuthentication, getMessage)
router.route('/user').get(userAuthentication, getUser)

// notification routes
router
  .route('/notifications/subscription')
  .post(userAuthentication, subscribe)
  .delete(userAuthentication, unsubscribe)
router.route('/notification/:id').post(userAuthentication, sendNotification)

module.exports = router
