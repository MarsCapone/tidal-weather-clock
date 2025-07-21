import pino, { Logger } from 'pino'
import { ILogger, LogFn } from '@/types/interfaces'

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

  makeNew = (context: Record<string, any>) => {
    const child = this.pinoLogger.child(context)
    return new CustomPinoLogger(child)
  }
}

const _logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
    bindings: (bindings) => {
      return {
        source: 'server',
        node_version: process.version,
      }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

const logger = new CustomPinoLogger(_logger)

export default logger
