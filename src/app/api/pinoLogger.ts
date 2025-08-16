import { ILogger, LogFn } from '@/lib/types/interfaces'
import pino, { Logger } from 'pino'

class CustomPinoLogger implements ILogger {
  constructor(private readonly pinoLogger: Logger) {
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

  makeNew = (context: Record<string, unknown>) => {
    const child = this.pinoLogger.child(context)
    return new CustomPinoLogger(child)
  }
}

const _logger = pino({
  formatters: {
    bindings: (bindings) => {
      return {
        source: 'server',
      }
    },
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  level: process.env.LOG_LEVEL || 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
})

const logger = new CustomPinoLogger(_logger)

export default logger
