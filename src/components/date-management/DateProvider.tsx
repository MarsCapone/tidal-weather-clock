'use client'
import { DateContext } from '@/lib/utils/contexts'
import { TZDate } from '@date-fns/tz'
import React, { useState } from 'react'
import DatePagination from '@/components/date-management/DatePagination'

type DateProviderProps = {
  initialDate: TZDate
} & React.PropsWithChildren

export default function DateProvider({
  initialDate,
  children,
}: DateProviderProps) {
  const [date, setDate] = useState<TZDate>(initialDate)

  return (
    <DateContext value={{ date, setDate }}>
      <DatePagination
        date={date}
        setDate={setDate}
        nextPath={'/plus/1'}
        prevPath={'/plus/-1'}
      />
      {children}
    </DateContext>
  )
}
