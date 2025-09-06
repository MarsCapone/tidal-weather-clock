'use client'

import DatePagination from '@/components/date-management/DatePagination'
import { DateContext } from '@/lib/utils/contexts'
import { TZDate } from '@date-fns/tz'
import { formatISO } from 'date-fns'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const updateDate = (newDate: TZDate) => {
    setDate(newDate)
    const newPath = `/static/${formatISO(newDate, {
      representation: 'date',
    })}`
    router.push(newPath)
  }

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
