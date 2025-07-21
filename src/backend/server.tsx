import { serve } from 'bun'
import index from '@/ui/index.html'
import getDataContextsForDateString from '@/backend/handlers/dataContext'

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

      const result = await getDataContextsForDateString(dateString)

      return Response.json(result)
    },
  },
})

// eslint-disable-next-line no-console
console.log(`🚀 Server running at ${server.url}`)
