import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
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
        <Link href={prevPath || '/public'}>
          <div className={`join-item btn ${!prevPath ? 'btn-disabled' : ''}`}>
            <ChevronLeftIcon height={20} width={20} />
          </div>
        </Link>
        <div className="join-item btn btn-disabled bg-primary text-base-content">
          {format(date, 'PPPP')}
        </div>
        <Link href={nextPath || '/public'}>
          <div className={`join-item btn ${!nextPath ? 'btn-disabled' : ''}`}>
            <ChevronRightIcon height={20} width={20} />
          </div>
        </Link>
      </div>
    </div>
  )
}
