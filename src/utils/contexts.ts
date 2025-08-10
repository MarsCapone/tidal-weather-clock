import { createContext } from 'react'

export const DarkModeContext = createContext<boolean>(false)

export const TimeZoneContext = createContext<string>('Etc/UTC')
