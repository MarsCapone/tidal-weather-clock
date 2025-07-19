import { serve } from 'bun'
import index from '@/ui/index.html'
import {
  DemoStormglassDataFetcher,
  StormglassDataFetcher,
} from '@/utils/fetchData'
import * as process from 'node:process'
import { formatISO, min, parseISO, startOfDay } from 'date-fns'
import { DebugMemoryCache } from '@/backend/cache'
import logger from '@/backend/logger'
import { DataContext } from '@/types/data'

const dataFetcher = new StormglassDataFetcher(
  logger,
  Bun.env.STORMGLASS_API_KEY!,
)
// const dataFetcher = new DemoStormglassDataFetcher(logger)
const cache = new DebugMemoryCache()

const server = serve({
  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },

  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    '/api/dataContext/:dateString': async (req) => {
      const dateString = req.params.dateString

      // query the earliest of either the provided date or today
      const queryDay = min([
        startOfDay(parseISO(dateString)),
        startOfDay(new Date()),
      ])

      const cachedData = cache.getCacheValue<DataContext[]>('all-contexts', {
        expiryHours: 4,
      })
      if (!cachedData) {
        logger.info('fetching data', {
          dateString,
          fetcher: dataFetcher.constructor.name,
        })
        const data = await dataFetcher.getDataContexts(queryDay)

        cache.setCacheValue('all-contexts', data)

        return Response.json(data)
      }
      return Response.json([])
    },
  },
})

// eslint-disable-next-line no-console
console.log(`🚀 Server running at ${server.url}`)
