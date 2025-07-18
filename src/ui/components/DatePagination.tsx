import { Link } from 'react-router'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns'

export default function DatePagination({
  nextPath,
  prevPath,
  date,
}: {
  nextPath: string | null
  prevPath: string | null
  date: Date
}) {
  return (
    <div>
      <div className="join">
        <div className={`join-item btn ${!prevPath ? 'btn-disabled' : ''}`}>
          <Link to={prevPath || '/'}>
            <ChevronLeftIcon height={20} width={20} />
          </Link>
        </div>
        <div className="join-item btn">{format(date, 'PPPP')}</div>
        <div className={`join-item btn ${!nextPath ? 'btn-disabled' : ''}`}>
          <Link to={nextPath || '/'}>
            <ChevronRightIcon height={20} width={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}
