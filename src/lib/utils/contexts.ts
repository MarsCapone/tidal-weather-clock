import { TZDate } from '@date-fns/tz'
import { createContext } from 'react'

export const DarkModeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: (v: boolean) => {},
})

export const TimeZoneContext = createContext({
  timeZone: 'Etc/UTC',
  setTimeZone: (tz: string) => {},
})

export const DateContext = createContext({
  date: new TZDate(),
  isPast: false,
  setDate: (d: TZDate) => {},
})
