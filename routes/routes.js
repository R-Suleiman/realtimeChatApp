const express = require('express')
const router = express.Router()

const userAuthentication = require('../middleware/authentication')
const { register, login, getUser } = require('../controllers/auth')
const {
  createMessage,
  getMessages,
  deleteMessage,
  clearChat,
} = require('../controllers/messages')

router.route('/register').post(register)
router.route('/login').post(login)
router
  .route('/messages/:room')
  .post(userAuthentication, createMessage)
  .get(userAuthentication, getMessages)
  .patch(userAuthentication, clearChat)
router.route('/messages/:id').delete(deleteMessage)
router.route('/user').get(userAuthentication, getUser)

module.exports = router
