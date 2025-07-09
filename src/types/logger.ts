import { Logger as PinoLogger } from 'pino'

export type LogFn<T extends Record<string, any> = Record<string, any>> = (
  message: string,
  context?: T,
) => void
type LoggerMaker = (context: Record<string, any>) => Logger

export interface ILogger {
  info: LogFn
  warn: LogFn
  error: LogFn
  debug: LogFn
  makeNew: LoggerMaker
}

class Logger implements ILogger {
  constructor(private readonly pinoLogger: PinoLogger) {
    this.pinoLogger = pinoLogger
  }

  info: LogFn = (message, context) => {
    this.pinoLogger.info(context, message)
  }

  warn: LogFn = (message, context) => {
    this.pinoLogger.warn(context, message)
  }

  error: LogFn = (message, context) => {
    this.pinoLogger.error(context, message)
  }

  debug: LogFn = (message, context) => {
    this.pinoLogger.debug(context, message)
  }

  makeNew = (context: Record<string, any>) => {
    const child = this.pinoLogger.child(context)
    return new Logger(child)
  }
}

export default Logger
