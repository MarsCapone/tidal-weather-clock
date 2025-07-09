import pino from 'pino'
import Logger from '@/types/logger'

const _logger = pino({
  level: 'debug',
  browser: {
    asObjectBindingsOnly: true,
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
    bindings: (bindings) => {
      return {
        source: 'client',
      }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

const logger = new Logger(_logger)

export default logger
