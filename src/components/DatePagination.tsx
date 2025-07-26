import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import Link from 'next/link'

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
  return (
    <div>
      <div className="join">
        <div className={`join-item btn ${!prevPath ? 'btn-disabled' : ''}`}>
          <Link href={prevPath || '/public'}>
            <ChevronLeftIcon height={20} width={20} />
          </Link>
        </div>
        <div className="join-item btn btn-disabled bg-primary text-base-content">
          {format(date, 'PPPP')}
        </div>
        <div className={`join-item btn ${!nextPath ? 'btn-disabled' : ''}`}>
          <Link href={nextPath || '/public'}>
            <ChevronRightIcon height={20} width={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}
