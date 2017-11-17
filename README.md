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
const serviceError = require('@razvanz/service-error')
  .bind(null, ERROR_MAP)

// Create a default, E_INTERNAL, error
serviceError()

/*
{ InternalError: Internal error
    at ServiceError (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:19:5)
    at createServiceError (/Users/razvanz/workspace/github/node-service-error/src/create-service-error.js:22:10)
    at repl:1:1
    ...
  code: 'E_INTERNAL',
  name: 'InternalError',
  inner_error: undefined,
  status_code: 500,
  raw_message: 'Internal error',
  raw_data: [] }
*/

// Create a simple error (alternatively `serviceError(ERROR_MAP.E_SIMPLE_FAIL)`)
serviceError('E_SIMPLE_FAIL')

/*
{ SimpleFailError: Failed to do something simple
    at ServiceError (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:19:5)
    at createServiceError (/Users/razvanz/workspace/github/node-service-error/src/create-service-error.js:22:10)
    at repl:1:1
    ...
  code: 'E_SIMPLE_FAIL',
  name: 'SimpleFailError',
  inner_error: undefined,
  status_code: 500,
  raw_message: 'Failed to do something simple',
  raw_data: [] }
 */


// Create a more complex error
const innerError = new Error('fail')
const payload = { data: 'value' }
serviceError('E_RANDOM_FAIL', innerError, 'descriptive message here ...', payload)

/*
{ RandomFailError: descriptive message here ...
    at ServiceError (/Users/razvanz/workspace/github/node-service-error/src/service-error.js:19:5)
    at createServiceError (/Users/razvanz/workspace/github/node-service-error/src/create-service-error.js:22:10)
    at repl:1:1
    ...
  code: 'E_RANDOM_FAIL',
  name: 'RandomFailError',
  inner_error:
   Error: fail
       at repl:1:20
       ...
  status_code: 500,
  raw_message: '%s',
  raw_data: [ 'descriptive message here ...', { data: 'value' } ] }
 */
```

Changelog
---------

- v1.0.2
  - republish to npm
- v1.0.1
  - fix: enforce engine `node@^6.0.0` (#2)
- v1.0.0
  - Initial functionality
