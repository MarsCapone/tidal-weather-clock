import { TZDate } from '@date-fns/tz'
import { createContext } from 'react'

type ContextSetter<T, Name extends string> = {
  [K in Name]: T
} & {
  [K in Name as `set${Capitalize<K>}`]: (value: T) => void
}

export const DarkModeContext = createContext<
  ContextSetter<boolean, 'isDarkMode'>
>({
  isDarkMode: false,
  setIsDarkMode: () => {},
})

export const TimeZoneContext = createContext<ContextSetter<string, 'timeZone'>>(
  {
    timeZone: 'Etc/UTC',
    setTimeZone: () => {},
  },
)

export const DateContext = createContext<
  ContextSetter<TZDate, 'date'> & { isPast: boolean }
>({
  date: new TZDate(),
  isPast: false,
  setDate: () => {},
})
