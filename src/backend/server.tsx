import { serve } from 'bun'
import index from '@/ui/index.html'
import { StormglassDataFetcher } from '@/utils/fetchData'
import * as process from 'node:process'
import CONSTANTS from '@/ui/constants'
import { parseISO, startOfDay, startOfToday } from 'date-fns'

const dataFetcher = new StormglassDataFetcher(
  CONSTANTS.LOCATION_COORDS,
  Bun.env.STORMGLASS_API_KEY,
)

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
      const date = startOfDay(parseISO(dateString))
      console.log(`Fetching data from ${dateString}`)
      return Response.json(dataFetcher.getDataContext(date))
    },
  },
})

// eslint-disable-next-line no-console
console.log(`🚀 Server running at ${server.url}`)
