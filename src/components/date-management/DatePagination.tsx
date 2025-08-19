import { addDays, format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { CalendarDateSelector } from '@/components/date-management/CalendarDateSelector'
import { TZDate } from '@date-fns/tz'

export type DatePaginationProps = {
  date: TZDate
  nextPath: string | null
  prevPath: string | null
  setDate: (d: TZDate) => void
}

export default function DatePagination({
  date,
  nextPath,
  prevPath,
  setDate,
}: DatePaginationProps) {
  const LinkWrapper = ({
    children,
    diff,
  }: {
    children: React.ReactNode
    diff: number
  }) => <div onClick={() => setDate(addDays(date, diff))}>{children}</div>

  const popoverId = 'date-pagination-calendar-popover'

  return (
    <div>
      <div className="join">
        <LinkWrapper diff={-1}>
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
        <LinkWrapper diff={1}>
          <div className={`join-item btn ${!nextPath ? 'btn-disabled' : ''}`}>
            <ChevronRightIcon height={20} width={20} />
          </div>
        </LinkWrapper>
      </div>
      <CalendarDateSelector popoverId={popoverId} />
    </div>
  )
}
