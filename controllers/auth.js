const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = User.createJWT()
  res.statue(StatusCodes.CREATED).json({ user: { name: user.username }, token })
}

const login = async (req, res) => {
  const { username, password } = req.body

  if (!username && !password) {
    throw new BadRequestError('Please provide username and password')
  }

  const user = await User.findOne({ username })

  if (user) {
    const isPasswordCorrect = await User.comparePassword(password)
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = User.createJWT()
    res.status(StatusCodes.OK).json({ user: { name: username }, token })
  }
}

module.exports = {
  register,
  login,
}
