node-service-error
==================

Utility for better error management in NodeJS

Install
-------

```bash
npm install @razvanz/service-error
```

Usage
-----

```javascript
const ERROR_MAP = {
  E_SIMPLE_FAIL: {
    code: 'E_SIMPLE_FAIL',
    name: 'SimpleFailError',
    message: 'Failed to do something simple'
  },
  E_RANDOM_FAIL: {
    code: 'E_RANDOM_FAIL',
    name: 'RandomFailError',
    message: '%s'
  }
}
const ServiceError = require('@razvanz/service-error')
const createError = ServiceError.factory(ERROR_MAP)

// Create a default, E_INTERNAL, error
createError()

/*
{ InternalError: Internal error
    at args (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:72:14)
    at repl:1:1
    ...
  name: 'InternalError',
  code: 'E_INTERNAL',
  raw_message: 'Internal error',
  raw_data: [],
  inner_error: undefined }
*/

// Create a simple error (alternatively `serviceError(ERROR_MAP.E_SIMPLE_FAIL)`)
createError('E_SIMPLE_FAIL')

/*
{ SimpleFailError: Failed to do something simple
    at args (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:72:14)
    at repl:1:1
    ...
  name: 'SimpleFailError',
  code: 'E_SIMPLE_FAIL',
  raw_message: 'Failed to do something simple',
  raw_data: [],
  inner_error: undefined }
*/


// Create a more complex error
const innerError = new Error('fail')
const payload = { data: 'value' }
createError('E_RANDOM_FAIL', innerError, 'descriptive message here ...', payload)

/*
{ RandomFailError: descriptive message here ...
    at args (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:72:14)
    at repl:1:1
    ...
  name: 'RandomFailError',
  code: 'E_RANDOM_FAIL',
  raw_message: '%s',
  raw_data: [ 'descriptive message here ...', { data: 'value' } ],
  inner_error: Error: fail
    at repl:1:20
    ... }
 */


// Create your own error subclass
class HttpError extends ServiceError {
  constructor (error, ...args) {
    super(error, ...args)

    this.name = 'HttpError'
    this.status_code = error.status_code
  }

  toJSON () {
    return Object.assign(super.toJSON(), { status_code: this.status_code })
  }
}
const HTTP_ERRROS = {
  E_NOT_FOUND: {
    code: 'E_NOT_FOUND',
    message: 'No resource found at "%s"',
    status_code: 404
  }
}
const createHttpError = HttpError.factory(HTTP_ERRROS)

createHttpError('E_NOT_FOUND', '/url-path')
/*
{ HttpError: No resource found at "/url-path"
    at args (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:72:14)
    at repl:1:1
    ...
  name: 'HttpError',
  code: 'E_NOT_FOUND',
  raw_message: 'No resource found at "%s"',
  raw_data: [ '/url-path' ],
  inner_error: null,
  status_code: 404 }
 */
```

Changelog
---------

- v2.0.0
  - feat: improve interface to allow inheritance (#4)
- v1.0.2
  - republish to npm
- v1.0.1
  - fix: enforce engine `node@^6.0.0` (#2)
- v1.0.0
  - Initial functionality
