const util = require('util')

const FORMAT_PLACEHOLDERS_REG_EXP = /%s|%d|%j/g
const DEFAULT_ERROR = {
  code: 'E_INTERNAL',
  name: 'InternalError',
  message: 'Internal error'
}

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
    const error = Object.assign(this.toJSON(), { stack: this.stack })

    if (error.inner_error) { // if there is an inner error add it's stack too
      error.inner_error = Object.assign(error.inner_error, { stack: this.inner_error.stack })
    }

    return util.inspect(error, { depth: 4 })
  }

  static factory (ERRORS) {
    if (!ERRORS || typeof ERRORS !== 'object') {
      throw new Error(`Invalid ERROR_MAP value "${ERRORS}"`)
    }

    return (error, innerError, ...args) => {
      if (typeof error === 'string') {
        error = ERRORS[error]
      }

      if (!error || !(error.code in ERRORS)) {
        innerError = error || innerError
        error = DEFAULT_ERROR
      }

      return new this.prototype.constructor(error, innerError, ...args)
    }
  }

  static get DEFAULT_ERROR () {
    return DEFAULT_ERROR
  }
}

module.exports = ServiceError
