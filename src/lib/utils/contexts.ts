import { createContext } from 'react'

export const DarkModeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: (v: boolean) => {},
})

export const TimeZoneContext = createContext({
  timeZone: 'Etc/UTC',
  setTimeZone: (tz: string) => {},
})
