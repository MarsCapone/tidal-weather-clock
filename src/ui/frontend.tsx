/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from 'react-dom/client'
import App from './App'
import './App.css'

import { StrictMode } from 'react'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router'
import Layout from '@/ui/Layout'
import {
  addDays,
  formatISO,
  isWithinInterval,
  parseISO,
  startOfToday,
  startOfTomorrow,
} from 'date-fns'

const PERMITTED_INTERVAL = {
  end: addDays(startOfToday(), 7),
  start: startOfToday(),
}

const router = createBrowserRouter([
  {
    children: [
      {
        Component: App,
        loader: async ({ params }) => {
          const date = params.dateString
            ? parseISO(params.dateString)
            : startOfToday()

          // if the date is specified directly, we don't redirect
          if (params.dateString) {
            // we're specifying iso dates, so keep doing that
            return {
              date,
              nextPath: `/${formatISO(addDays(date, 1), { representation: 'date' })}`,
              prevPath: `/${formatISO(addDays(date, -1), { representation: 'date' })}`,
            }
          }

          // we didn't specify anything, so use relative dates
          return {
            date,
            nextPath: '/plus/1',
            prevPath: null,
          }
        },
        path: ':dateString?',
      },
      {
        Component: App,
        loader: async ({ params }) => {
          const days = Number.parseInt(params.days!)
          if (days < 0 || days > 7) {
            return redirect('/')
          }
          return {
            date: addDays(startOfToday(), days),
            nextPath: days + 1 <= 7 ? `/plus/${days + 1}` : null,
            prevPath: days - 1 >= 0 ? `/plus/${days - 1}` : null,
          }
        },
        path: 'plus/:days',
      },
    ],
    Component: Layout,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
