import { createContext } from 'react'
import { SessionData } from '@auth0/nextjs-auth0/types'

export const DarkModeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: (v: boolean) => {},
})

export const TimeZoneContext = createContext({
  timeZone: 'Etc/UTC',
  setTimeZone: (tz: string) => {},
})

export const SessionContext = createContext<SessionData | null>(null)
