const ServiceError = require('./service-error')
const E_INTERNAL = {
  code: 'E_INTERNAL',
  name: 'InternalError',
  message: 'Internal error'
}

function createServiceError (ErrorType, ERROR_MAP, error, innerError, ...args) {
  if (!ERROR_MAP || typeof ERROR_MAP !== 'object') {
    throw new Error(`Invalid ERROR_MAP value "${ERROR_MAP}"`)
  }

  if (!ErrorType) {
    ErrorType = ServiceError
  }

  if (typeof error === 'string') {
    error = ERROR_MAP[error]
  }

  if (!error || !(error.code in ERROR_MAP)) {
    innerError = error || innerError
    error = E_INTERNAL
  }

  return new ErrorType(error, innerError, ...args)
}

module.exports = createServiceError
module.exports.ServiceError = ServiceError
module.exports.E_INTERNAL = E_INTERNAL
