'use client'

import { dateOptions } from '@/lib/utils/dates'
import { formatISO, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import React from 'react'
import { DayPicker } from 'react-day-picker'

type CalendarDateSelectorProps = {
  popoverId: string
  date: Date
  dataContextRange: { earliest: string; latest: string }
}

export function CalendarDateSelector({
  popoverId,
  date,
  dataContextRange: { earliest, latest },
}: CalendarDateSelectorProps) {
  const router = useRouter()

  const updateDate = (newDate: Date | undefined) => {
    const newDateISO = newDate
      ? formatISO(newDate, { ...dateOptions, representation: 'date' })
      : undefined
    if (newDateISO) {
      router.push(`/static/${newDateISO}`)
    }
  }

  return (
    <div
      popover={'auto'}
      id={popoverId}
      className={'dropdown'}
      style={{ positionAnchor: `--${popoverId}` } as React.CSSProperties}
    >
      <DayPicker
        className={'react-day-picker'}
        mode={'single'}
        selected={date}
        onSelect={updateDate}
        timeZone={'UTC'}
        disabled={[
          { before: parseISO(earliest, dateOptions) },
          { after: parseISO(latest, dateOptions) },
        ]}
      />
    </div>
  )
}
