import util from 'util'

const FORMAT_PLACEHOLDERS_REG_EXP = /%s|%d|%j/g
const DEFAULT_ERROR = {
  name: 'InternalError',
  message: 'Internal error',
  code: 'E_INTERNAL'
}

export type ErrorDefinition = {
  name: string;
  message: string;
  code: string;
}

export type ErrorJSON = {
  name: string;
  message: string;
  code: string;
  data: any[];
  innerError: ErrorJSON | null;
}

export interface ExtendedError extends Error {
  code?: string;

  toString?(): string;
  toJSON?(): ErrorJSON;
}

export class ServiceError<E extends Error> extends Error implements ExtendedError {
  public name: string;
  public message: string;
  public code: string;
  public data: any[];
  public innerError: E | null;

  constructor (definition: ErrorDefinition, ...data: any[]);
  constructor (definition: ErrorDefinition, innerError: E, ...data: any[])
  constructor (definition: ErrorDefinition, innerError?: E, ...data: any[]) {
    data = data || []

    if (innerError && !(innerError instanceof Error)) {
      data.unshift(innerError)
      innerError = undefined
    }

    const bindArgs = definition.message.match(FORMAT_PLACEHOLDERS_REG_EXP)
    const message = bindArgs
      ? util.format(definition.message, ...data.slice(0, bindArgs.length))
      : definition.message

    super(message)
    this.name = definition.name
    this.code = definition.code
    this.data = data
    this.innerError = innerError || null
  }

  toJSON (): ErrorJSON {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      data: this.data,
      innerError: this.innerError
        ? typeof (this.innerError as unknown as ServiceError<Error>).toJSON === 'function'
            ? (this.innerError as unknown as ServiceError<Error>).toJSON()
            : {
                ...this.innerError,
                name: this.innerError.name,
                message: this.innerError.message,
                code: (this.innerError as unknown as ServiceError<Error>).code,
                data: [],
                innerError: null
              }
        : null
    }
  }

  toString (): string {
    return util.format(this)
  }

  static factory<E extends Error> (
    ERRORS?: { [code: string]: ErrorDefinition }
  ): (codeOrDefinition?: string | ErrorDefinition, innerError?: E | any, ...args: any[]) => ServiceError<E> {
    if (!ERRORS || typeof ERRORS !== 'object') {
      throw new Error(`Invalid ERROR_MAP value "${ERRORS}"`)
    }

    return (codeOrDefinition?: string | ErrorDefinition, innerError?: E | any, ...args: any[]) => {
      let definition = typeof codeOrDefinition === 'string'
        ? ERRORS[codeOrDefinition]
        : codeOrDefinition

      if (!definition || !(definition.code in ERRORS)) {
        innerError = (definition as unknown as E) || innerError
        definition = DEFAULT_ERROR
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return new this.prototype.constructor(definition, innerError, ...args)
    }
  }

  static get DEFAULT_ERROR (): ErrorDefinition {
    return DEFAULT_ERROR
  }
}

export default ServiceError
module.exports = ServiceError
