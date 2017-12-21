const { assert } = require('chai')
const ServiceError = require('../src/service-error')

const ERROR_MAP = {
  E_SPECIFIC_FAIL: {
    code: 'E_SPECIFIC_FAIL',
    name: 'SpecificFailError',
    message: 'Fail %s: %d: %j'
  },
  E_RANDOM_FAIL: {
    code: 'E_RANDOM_FAIL',
    name: 'RandomFailError',
    message: '%s'
  }
}

describe('module', () => {
  it('exposes a ServiceError class', () =>
    assert.typeOf(ServiceError, 'function'))
  it('exposes factory method', () =>
    assert.isDefined(ServiceError.factory))
  it('exposes DEFAULT_ERROR', () =>
    assert.isDefined(ServiceError.DEFAULT_ERROR))

  describe('ServiceError', () => {
    it('serializes to JSON', () => {
      const innerE = new Error('fail')
      innerE.code = 'inner_code'
      const error = new ServiceError(
        ERROR_MAP.E_RANDOM_FAIL, innerE, 'failure message', { data: 1 }
      )
      const serialized = JSON.parse(JSON.stringify(error))

      assert.equal(serialized.code, 'E_RANDOM_FAIL')
      assert.equal(serialized.name, 'RandomFailError')
      assert.equal(serialized.message, 'failure message')
      assert.equal(serialized.raw_message, '%s')
      assert.deepEqual(serialized.raw_data, ['failure message', { 'data': 1 }])
      assert.isDefined(serialized.inner_error)
      assert.equal(serialized.inner_error.name, 'Error')
      assert.equal(serialized.inner_error.message, 'fail')
      assert.equal(serialized.inner_error.code, 'inner_code')
    })

    it('serializes to string', () => {
      const innerE = new Error('fail')
      innerE.code = 'inner_code'
      const error = new ServiceError(
        ERROR_MAP.E_RANDOM_FAIL, innerE, 'failure message', { data: 1 }
      )
      const serialized = `${error}`

      assert.typeOf(serialized, 'string')
      // error
      assert.match(serialized, /code: 'E_RANDOM_FAIL'/)
      assert.match(serialized, /name: 'RandomFailError'/)
      assert.match(serialized, /message: 'failure message'/)
      assert.match(serialized, /stack: 'RandomFailError: failure message.*/)
      // inner error
      assert.match(serialized, /name: 'Error'/)
      assert.match(serialized, /code: 'inner_code'/)
      assert.match(serialized, /message: 'fail/)
      assert.match(serialized, /stack: 'Error: fail.*/)
    })
  })

  describe('factory', () => {
    const createFromMap = ServiceError.factory(ERROR_MAP)

    it('throws error if called without error map', () =>
      assert.throws(() => ServiceError.factory()))

    describe('with known error string', () => {
      const createWithString = createFromMap.bind(null, 'E_SPECIFIC_FAIL')

      it('creates a ServiceError', () => {
        const error = createWithString()
        assert.instanceOf(error, ServiceError)
        assert.equal(error.code, 'E_SPECIFIC_FAIL')
      })

      it('wrapps an inner error', () => {
        const innerE = new Error('fail')
        const error = createWithString(innerE)
        assert.equal(error.inner_error, innerE)
      })

      it('binds arguments to message', () => {
        const error = createWithString('string', 0, { a: 1 }, 'extra')
        assert.equal(error.message, 'Fail string: 0: {"a":1}')
      })

      it('stores args under raw_data', () => {
        const error = createWithString('string', 0, { a: 1 }, 'extra')
        assert.deepEqual(error.raw_data, ['string', 0, { a: 1 }, 'extra'])
      })
    })

    describe('with known error object', () => {
      const createWithObject = createFromMap.bind(null, ERROR_MAP.E_SPECIFIC_FAIL)

      it('creates a ServiceError', () => {
        const error = createWithObject()
        assert.instanceOf(error, ServiceError)
        assert.equal(error.code, 'E_SPECIFIC_FAIL')
      })

      it('wrapps an inner error', () => {
        const innerE = new Error('fail')
        const error = createWithObject(innerE)
        assert.equal(error.inner_error, innerE)
      })

      it('binds arguments to message', () => {
        const error = createWithObject('string', 0, { a: 1 }, 'extra')
        assert.equal(error.message, 'Fail string: 0: {"a":1}')
      })

      it('stores args under raw_data', () => {
        const error = createWithObject('string', 0, { a: 1 }, 'extra')
        assert.deepEqual(error.raw_data, ['string', 0, { a: 1 }, 'extra'])
      })
    })

    describe('with unknown error', () => {
      const createUnknown = createFromMap.bind(null, 'E_UNKNOWN')

      it('creates an E_INTERNAL ServiceError', () => {
        const error = createUnknown()
        assert.instanceOf(error, ServiceError)
        assert.equal(error.code, 'E_INTERNAL')
      })

      it('wrapps an inner error', () => {
        const innerE = new Error('fail')
        const error = createUnknown(innerE)
        assert.equal(error.inner_error, innerE)
      })

      it('stores args under raw_data', () => {
        const error = createUnknown('string', 0, { a: 1 }, 'extra')
        assert.deepEqual(error.raw_data, ['string', 0, { a: 1 }, 'extra'])
      })
    })
  })

  describe('inheritance', () => {
    class MyError extends ServiceError {
      constructor (...args) {
        super(...args)
        this.name = 'MyError'
      }
    }
    const MY_ERRROS = {
      E_FAILURE: {
        code: 'E_FAILURE',
        message: 'Something failed'
      }
    }
    const createMyError = MyError.factory(MY_ERRROS)

    it('factory creates appropriate instance', () => {
      const error = createMyError('E_FAILURE')

      assert.instanceOf(error, ServiceError)
      assert.instanceOf(error, MyError)
    })

    it('inherits default error', () => {
      const error = createMyError()

      assert.equal(error.code, ServiceError.DEFAULT_ERROR.code)
    })
  })
})
