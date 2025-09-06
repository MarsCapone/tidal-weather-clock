'use client'

import DatePagination from '@/components/date-management/DatePagination'
import { DateContext } from '@/lib/utils/contexts'
import logger from '@/lib/utils/logger'
import { TZDate } from '@date-fns/tz'
import { formatISO } from 'date-fns'
import React, { useState } from 'react'

type DateProviderProps = {
  initialDate: TZDate
  dataContextRange: { earliest: string; latest: string }
} & React.PropsWithChildren

export default function DateProvider({
  initialDate,
  dataContextRange,
  children,
}: DateProviderProps) {
  const [date, setDate] = useState<TZDate>(initialDate)

  const updateDate = (newDate: TZDate) => {
    setDate(newDate)
    window.history.pushState(
      {
        date: formatISO(newDate, { representation: 'date' }),
      },
      '',
      `/static/${formatISO(newDate, {
        representation: 'date',
      })}`,
    )
  }

  window.addEventListener('popstate', (event) => {
    const stateDate = event.state.date
    logger.debug('detected history state change', {
      stateDate,
    })
    if (stateDate !== undefined) {
      setDate(stateDate)
    }
  })

  return (
    <DateContext value={{ date, setDate }}>
      <DatePagination
        date={date}
        setDate={updateDate}
        dataContextRange={dataContextRange}
      />
      {children}
    </DateContext>
  )
}
