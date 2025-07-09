import pino from 'pino'
import Logger from '@/types/logger'

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

const logger = new Logger(_logger)
