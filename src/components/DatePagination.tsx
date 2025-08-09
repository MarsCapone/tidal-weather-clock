import useApiRequest, { useDataContextInfo } from '@/hooks/apiRequests'
import { dateOptions } from '@/utils/dates'
import { format, formatISO, parseISO } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { DayPicker } from 'react-day-picker'

export type DatePaginationProps = {
  date: Date
  nextPath: string | null
  prevPath: string | null
}

export default function DatePagination({
  date,
  nextPath,
  prevPath,
}: DatePaginationProps) {
  const LinkWrapper = ({
    children,
    path,
  }: {
    children: React.ReactNode
    path: string | null
  }) => (path ? <Link href={path}>{children}</Link> : <div>{children}</div>)

  const popoverId = 'date-pagination-calendar-popover'

  return (
    <div>
      <div className="join">
        <LinkWrapper path={prevPath}>
          <div className={`join-item btn ${!prevPath ? 'btn-disabled' : ''}`}>
            <ChevronLeftIcon height={20} width={20} />
          </div>
        </LinkWrapper>
        <button
          popoverTarget={popoverId}
          className="join-item btn text-base-content"
          style={{ anchorName: `--${popoverId}` } as React.CSSProperties}
        >
          {format(date, 'PPPP')}
        </button>
        <LinkWrapper path={nextPath}>
          <div className={`join-item btn ${!nextPath ? 'btn-disabled' : ''}`}>
            <ChevronRightIcon height={20} width={20} />
          </div>
        </LinkWrapper>
      </div>
      <CalendarDateSelector popoverId={popoverId} />
    </div>
  )
}

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
