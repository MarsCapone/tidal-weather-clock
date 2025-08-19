'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useDataContextInfo } from '@/hooks/apiRequests'
import { formatISO, parseISO } from 'date-fns'
import { dateOptions } from '@/lib/utils/dates'
import { DayPicker } from 'react-day-picker'

export function CalendarDateSelector({ popoverId }: { popoverId: string }) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const router = useRouter()
  const response = useDataContextInfo(null)

  const updateDate = (newDate: Date | undefined) => {
    setDate(newDate)
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
        disabled={
          response !== null
            ? [
                { before: parseISO(response.earliest, dateOptions) },
                { after: parseISO(response.latest, dateOptions) },
              ]
            : undefined
        }
      />
    </div>
  )
}
