const express = require('express')
const router = express.Router()

const userAuthentication = require('../middleware/authentication')
const { register, login } = require('../controllers/auth')
const { createMessage, getMessages } = require('../controllers/messages')

router.route('/register').post(register)
router.route('/login').post(login)
router
  .route('/messages')
  .post(userAuthentication, createMessage)
  .get(userAuthentication, getMessages)

module.exports = router
