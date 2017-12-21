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
    this.name = error.name
    this.code = error.code
    this.raw_message = error.message
    this.raw_data = args
    this.inner_error = innerError
  }

  toJSON () {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      raw_message: this.raw_message,
      raw_data: this.raw_data,
      inner_error: this.inner_error && Object.assign({
        name: this.inner_error.name,
        code: this.inner_error.code,
        message: this.inner_error.message
      }, this.inner_error)
    }
  }

  toString () {
    return util.inspect({
      name: this.name,
      code: this.code,
      message: this.message,
      stack: this.stack,
      raw_message: this.raw_message,
      raw_data: this.raw_data,
      inner_error: this.inner_error && Object.assign({
        name: this.inner_error.name,
        code: this.inner_error.code,
        message: this.inner_error.message,
        stack: this.inner_error.stack
      }, this.inner_error)
    }, { depth: 4 })
  }
}

module.exports = ServiceError
