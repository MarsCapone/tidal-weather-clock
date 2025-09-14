import { TZDate } from '@date-fns/tz'
import { createContext } from 'react'

export const DarkModeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: () => {},
})

export const TimeZoneContext = createContext({
  timeZone: 'Etc/UTC',
  setTimeZone: () => {},
})

export const DateContext = createContext({
  date: new TZDate(),
  isPast: false,
  setDate: () => {},
})
