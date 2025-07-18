import { ILogger, LogFn } from '@/types/logger'

class ClientLogger implements ILogger {
  private readonly context: Record<string, any>

  constructor(context: Record<string, any> = {}) {
    this.context = context
  }

  log = (
    level: keyof Omit<ILogger, 'makeNew'>,
    message: string,
    context: Record<string, any> | undefined,
  ) => {
    const extendedContext = {
      ...this.context,
      ...(context || {}),
    }
    console[level](message, extendedContext)
  }
  info: LogFn<Record<string, any>> = (message, context) => {
    this.log('info', message, context)
  }
  warn: LogFn<Record<string, any>> = (message, context) => {
    this.log('warn', message, context)
  }
  error: LogFn<Record<string, any>> = (message, context) => {
    this.log('error', message, context)
  }
  debug: LogFn<Record<string, any>> = (message, context) => {
    this.log('debug', message, context)
  }
  makeNew = (context: Record<string, any>) => {
    return new ClientLogger({
      ...this.context,
      ...context,
    })
  }
}

const logger = new ClientLogger()

export default logger
