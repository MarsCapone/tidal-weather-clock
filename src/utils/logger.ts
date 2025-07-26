import { ILogger, LogFn } from '../types/interfaces'

export class ConsoleLogger implements ILogger {
  private readonly context: Record<string, unknown>

  constructor(context: Record<string, unknown> = {}) {
    this.context = context
  }

  log = (
    level: keyof Omit<ILogger, 'makeNew'>,
    message: string,
    context: Record<string, unknown> | undefined,
  ) => {
    const extendedContext = {
      ...this.context,
      ...(context || {}),
    }
    /* eslint no-console: 'off' -- this is the logger so it makes sense to use console
     */
    console[level](message, extendedContext)
  }
  info: LogFn = (message, context) => {
    this.log('info', message, context)
  }
  warn: LogFn = (message, context) => {
    this.log('warn', message, context)
  }
  error: LogFn = (message, context) => {
    this.log('error', message, context)
  }
  debug: LogFn = (message, context) => {
    this.log('debug', message, context)
  }
  makeNew = (context: Record<string, unknown>) => {
    return new ConsoleLogger({
      ...this.context,
      ...context,
    })
  }
}

const logger = new ConsoleLogger()

export default logger
