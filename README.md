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
const { ServiceError } = require('@razvanz/service-error')
const createError = ServiceError.factory(ERROR_MAP)

// Create a default, E_INTERNAL, error
createError()

/*
ServiceError [InternalError]: Internal error
    at /home/razvanz/workspace/github/node-service-error/src/service-error.js:68:20
    at Object.<anonymous> (/home/razvanz/workspace/github/node-service-error/test.js:16:13)
    at Module._compile (internal/modules/cjs/loader.js:1200:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)
    at Module.load (internal/modules/cjs/loader.js:1049:32)
    at Function.Module._load (internal/modules/cjs/loader.js:937:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)
    at internal/main/run_main_module.js:17:47 {
  code: 'E_INTERNAL',
  data: [],
  innerError: null
}
*/

// Create a simple error (alternatively `serviceError(ERROR_MAP.E_SIMPLE_FAIL)`)
createError('E_SIMPLE_FAIL')

/*
ServiceError [SimpleFailError]: Failed to do something simple
    at /home/razvanz/workspace/github/node-service-error/src/service-error.js:68:20
    at Object.<anonymous> (/home/razvanz/workspace/github/node-service-error/test.js:18:13)
    at Module._compile (internal/modules/cjs/loader.js:1200:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)
    at Module.load (internal/modules/cjs/loader.js:1049:32)
    at Function.Module._load (internal/modules/cjs/loader.js:937:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)
    at internal/main/run_main_module.js:17:47 {
  code: 'E_SIMPLE_FAIL',
  data: [],
  innerError: null
}
*/


// Create a more complex error
const innerError = new Error('fail')
const payload = { data: 'value' }
createError('E_RANDOM_FAIL', innerError, 'descriptive message here ...', payload)

/*
ServiceError [RandomFailError]: descriptive message here ...
    at /home/razvanz/workspace/github/node-service-error/src/service-error.js:68:20
    at Object.<anonymous> (/home/razvanz/workspace/github/node-service-error/test.js:23:13)
    at Module._compile (internal/modules/cjs/loader.js:1200:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)
    at Module.load (internal/modules/cjs/loader.js:1049:32)
    at Function.Module._load (internal/modules/cjs/loader.js:937:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)
    at internal/main/run_main_module.js:17:47 {
  code: 'E_RANDOM_FAIL',
  data: [ 'descriptive message here ...', { data: 'value' } ],
  innerError: Error: fail
      at Object.<anonymous> (/home/razvanz/workspace/github/node-service-error/test.js:21:20)
      at Module._compile (internal/modules/cjs/loader.js:1200:30)
      at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)
      at Module.load (internal/modules/cjs/loader.js:1049:32)
      at Function.Module._load (internal/modules/cjs/loader.js:937:14)
      at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)
      at internal/main/run_main_module.js:17:47
}
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
HttpError: No resource found at "/url-path"
    at /home/razvanz/workspace/github/node-service-error/src/service-error.js:68:20
    at Object.<anonymous> (/home/razvanz/workspace/github/node-service-error/test.js:47:13)
    at Module._compile (internal/modules/cjs/loader.js:1200:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)
    at Module.load (internal/modules/cjs/loader.js:1049:32)
    at Function.Module._load (internal/modules/cjs/loader.js:937:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)
    at internal/main/run_main_module.js:17:47 {
  code: 'E_NOT_FOUND',
  data: [ '/url-path' ],
  innerError: null,
  status_code: 404
}
 */
```

Changelog
---------

- next
  - changed ServiceError.toJSON and ServiceError.toString implementations
  - changed ServiceError schema
  - rewrite in typescript
- v2.0.1
  - republish to npm
- v2.0.0
  - feat: improve interface to allow inheritance (#4)
- v1.0.2
  - republish to npm
- v1.0.1
  - fix: enforce engine `node@^6.0.0` (#2)
- v1.0.0
  - Initial functionality
