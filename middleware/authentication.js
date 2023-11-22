const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const userAuthentication = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid!')
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // attach the user to the req
    req.user = { userId: payload.userId, name: payload.username }
    next()
  } catch (error) {
    return res.redirect('../public/login.html')
  }
}

module.exports = userAuthentication
