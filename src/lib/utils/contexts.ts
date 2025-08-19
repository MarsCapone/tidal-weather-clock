import { createContext } from 'react'
import { TZDate } from '@date-fns/tz'

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
  setDate: (d: TZDate) => {},
})
