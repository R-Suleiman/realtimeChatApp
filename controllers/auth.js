const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({ user: { name: user.username }, token })
}

const login = async (req, res) => {
  const { username, password } = req.body

  if (!username && !password) {
    throw new BadRequestError('Please provide username and password')
  }

  const user = await User.findOne({ username })

  if (user) {
    const isPasswordCorrect = await user.comparePasswords(password)
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid Credentials')
    }

    const token = user.createJWT()
    res.status(StatusCodes.OK).json({ user: { name: username }, token })
  }
}

const getUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId })

  if (!user) {
    throw new NotFoundError('user not found')
  }
  res.status(StatusCodes.OK).json({ user })
}

module.exports = {
  register,
  login,
  getUser,
}
