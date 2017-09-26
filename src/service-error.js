const util = require('util')

const FORMAT_PLACEHOLDERS_REG_EXP = /%s|%d|%j/g

class ServiceError extends Error {
  constructor (error, innerError, ...args) {
    args = args || []

    if (innerError && !(innerError instanceof Error)) {
      args.unshift(innerError)
      innerError = null
    }

    let bindArgs = error.message.match(FORMAT_PLACEHOLDERS_REG_EXP)
    const message = bindArgs
      ? util.format.apply(util, [error.message].concat(args.slice(0, bindArgs.length)))
      : error.message

    super(message)
    this.code = error.code
    this.name = error.name
    this.inner_error = innerError
    this.status_code = error.status_code || (innerError && innerError.status) || 500
    this.raw_message = error.message
    this.raw_data = args
  }

  toJSON () {
    return {
      code: this.code,
      name: this.name,
      message: this.message,
      stack: this.stack,
      inner_error: this.serializeError(this.inner_error),
      status_code: this.status_code,
      raw_message: this.raw_message,
      raw_data: this.raw_data
    }
  }

  serializeError (e) {
    return e && Object.assign({
      name: e.name,
      message: e.message,
      code: e.code,
      stack: e.stack
    }, e)
  }
}

module.exports = ServiceError
