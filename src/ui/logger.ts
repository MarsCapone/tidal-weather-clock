import pino from 'pino'
import Logger from '@/types/logger'

// @ts-ignore
const _logger = pino({
  level: 'debug',
  browser: {
    asObjectBindingsOnly: true,
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

const logger = new Logger(_logger)

export default logger
