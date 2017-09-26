const { assert } = require('chai')
const createServiceError = require('../src/create-service-error')
const { ServiceError } = createServiceError

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
  it('exposes a function', () =>
    assert.typeOf(createServiceError, 'function'))
  it('exposes ServiceError', () =>
    assert.isDefined(createServiceError.ServiceError))
  it('exposes E_INTERNAL', () =>
    assert.isDefined(createServiceError.E_INTERNAL))

  describe('with error map', () => {
    const createFromMap = createServiceError.bind(null, ERROR_MAP)

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

  describe('without error map', () => {
    it('throws error', () =>
      assert.throws(() => createServiceError('E_INTERNAL')))
  })

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
      assert.equal(serialized.status_code, 500)
      assert.equal(serialized.raw_message, '%s')
      assert.deepEqual(serialized.raw_data, ['failure message', { 'data': 1 }])
      assert.isDefined(serialized.stack)
      assert.isDefined(serialized.inner_error)
      assert.equal(serialized.inner_error.name, 'Error')
      assert.equal(serialized.inner_error.message, 'fail')
      assert.equal(serialized.inner_error.code, 'inner_code')
      assert.isDefined(serialized.inner_error.stack)
    })
  })
})
