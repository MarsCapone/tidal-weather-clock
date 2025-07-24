/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the Home component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from 'react-dom/client'
import Home from './pages/Home'
import './global.css'

import { StrictMode } from 'react'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router'
import RootLayout from '@/ui/layouts/RootLayout'
import {
  addDays,
  formatISO,
  parseISO,
  startOfDay,
  startOfToday,
} from 'date-fns'
import CONSTANTS from '@/constants'
import SettingsLayout from '@/ui/layouts/SettingsLayout'
import InternalSettings from '@/ui/pages/InternalSettings'
import Settings from '@/ui/pages/Settings'
import ActivitySettings from '@/ui/pages/ActivitySettings'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorElement from '@/ui/components/ErrorElement'

const router = createBrowserRouter([
  {
    errorElement: <ErrorElement />,
    children: [
      {
        Component: Home,
        loader: async ({ params }) => {
          const date = params.dateString
            ? startOfDay(parseISO(params.dateString))
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
        Component: Home,
        loader: async ({ params }) => {
          const days = Number.parseInt(params.days!)
          if (days < 0 || days > CONSTANTS.MAX_PERMITTED_DAYS) {
            return redirect('/')
          }
          return {
            date: addDays(startOfToday(), days),
            nextPath:
              days + 1 <= CONSTANTS.MAX_PERMITTED_DAYS
                ? `/plus/${days + 1}`
                : null,
            prevPath: days - 1 >= 0 ? `/plus/${days - 1}` : null,
          }
        },
        path: 'plus/:days',
      },
      {
        errorElement: <ErrorElement />,
        children: [
          {
            Component: Settings,
            id: 'SettingsHome',
            loader: async () => {
              return {
                title: 'Settings',
              }
            },
            path: '',
          },
          {
            Component: InternalSettings,
            id: 'Internal',
            loader: async () => ({
              title: 'Internal Settings',
            }),
            path: 'internal',
          },
          {
            Component: ActivitySettings,
            id: 'Activities',
            loader: async () => ({
              title: 'Activity Settings',
            }),
            path: 'activities',
          },
        ],
        Component: SettingsLayout,
        id: 'Settings',
        path: 'settings',
      },
    ],
    Component: RootLayout,
    id: 'Home',
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
