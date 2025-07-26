import { addDays, formatISO, parseISO, startOfToday } from 'date-fns'
import { useState } from 'react'

export type DateInfo = {
  date: Date
  nextPath: string | null
  prevPath: string | null
}

export default function useDateString(
  params: Promise<{ dateString?: string[] | undefined }> | undefined,
): DateInfo {
  const [dateInfo, setDateInfo] = useState<DateInfo | null>()
  const today = startOfToday()
  const fallback = {
    date: today,
    nextPath: '/plus/1',
    prevPath: null,
  }

  if (params === undefined) {
    return fallback
  }

  params.then((p) => {
    let dateInfo

    if (!('dateString' in p) || !p.dateString || p.dateString.length === 0) {
      // the default is no path and we use relative paths for links
      dateInfo = fallback
    } else {
      // otherwise there is a dateString of some type
      const { dateString } = p
      if (dateString.length === 1) {
        // it's just a date string, so we can parse it and give the absolute
        // dates for next and previous
        const date = parseISO(dateString[0])
        dateInfo = {
          date,
          nextPath: `/${formatISO(addDays(date, 1))}`,
          prevPath: `/${formatISO(addDays(date, -1))}`,
        }
      } else if (dateString.length === 2) {
        // we expect it to be in the form `/plus/N`, where N is relative to today
        // we also want to cap N to be between 0 and the max permitted days
        const N = Number.parseInt(dateString[1])
        dateInfo = {
          date: addDays(today, N),
          nextPath: `/plus/${N + 1}`,
          prevPath: `/plus/${N - 1}`,
        }
      }
    }

    if (dateInfo === undefined) {
      dateInfo = {
        date: today,
        nextPath: `/`,
        prevPath: '/',
      }
    }
    setDateInfo(dateInfo)
  })

  return dateInfo || fallback
}
