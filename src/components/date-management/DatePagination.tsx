import { addDays, format, isAfter, isBefore } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import React from 'react'
import { CalendarDateSelector } from '@/components/date-management/CalendarDateSelector'
import { TZDate } from '@date-fns/tz'
import { utcDateStringToUtc } from '@/lib/utils/dates'

export type DatePaginationProps = {
  date: TZDate
  setDate: (d: TZDate) => void
  dataContextRange: { earliest: string; latest: string }
}

export default function DatePagination({
  date,
  setDate,
  dataContextRange: { earliest, latest },
}: DatePaginationProps) {
  const LinkWrapper = ({
    children,
    diff,
  }: {
    diff: number
  } & React.PropsWithChildren) => {
    const nextDay = addDays(date, diff)

    if (
      isBefore(nextDay, utcDateStringToUtc(earliest)) ||
      isAfter(nextDay, utcDateStringToUtc(latest))
    ) {
      return <div className={'join-item btn btn-disabled'}>{children}</div>
    }

    return (
      <div className={'join-item btn'} onClick={() => setDate(nextDay)}>
        {children}
      </div>
    )
  }

  const popoverId = 'date-pagination-calendar-popover'

  return (
    <div>
      <div className="join">
        <LinkWrapper diff={-1}>
          <ChevronLeftIcon height={20} width={20} />
        </LinkWrapper>
        <button
          popoverTarget={popoverId}
          className="join-item btn text-base-content"
          style={{ anchorName: `--${popoverId}` } as React.CSSProperties}
        >
          {format(date, 'PPPP')}
        </button>
        <LinkWrapper diff={1}>
          <ChevronRightIcon height={20} width={20} />
        </LinkWrapper>
      </div>
      <CalendarDateSelector popoverId={popoverId} date={date} />
    </div>
  )
}
