'use client'
import { DateContext } from '@/lib/utils/contexts'
import { TZDate } from '@date-fns/tz'
import React, { useState } from 'react'
import DatePagination from '@/components/date-management/DatePagination'

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

  return (
    <DateContext value={{ date, setDate }}>
      <DatePagination
        date={date}
        setDate={setDate}
        dataContextRange={dataContextRange}
      />
      {children}
    </DateContext>
  )
}
