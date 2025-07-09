import { serve } from 'bun'
import index from '@/ui/index.html'
import {
  DemoStormglassDataFetcher,
  StormglassDataFetcher,
} from '@/utils/fetchData'
import * as process from 'node:process'
import { parseISO, startOfDay, startOfToday } from 'date-fns'

const dataFetcher = new DemoStormglassDataFetcher()

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
      const data = await dataFetcher.getDataContexts(date)
      return Response.json(data)
    },
  },
})

// eslint-disable-next-line no-console
console.log(`🚀 Server running at ${server.url}`)
