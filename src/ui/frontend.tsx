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
            : startOfTomorrow()
          if (!isWithinInterval(date, PERMITTED_INTERVAL)) {
            return redirect('/')
          }
          return { date }
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
          return { date: addDays(startOfToday(), days) }
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
