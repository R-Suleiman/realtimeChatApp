const { StatusCodes } = require('http-status-codes')

const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try agin later',
  }

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',')
    customError.statusCode = 404
  }

  if (err.code && err.code === 11000) {
    ;(customError.msg = `Duplicate values for ${Object.keys(
      err.keyValue
    )} field. Please choose another value`),
      (err.statusCode = 400)
  }

  if (err.name === 'CastError') {
    customError.msg = `No item found with id ${err.value}`
    customError.statusCode = 404
  }

  return res.status(customError.statusCode).json({ message: customError.msg })
}

module.exports = errorHandlerMiddleware
