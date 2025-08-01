import { format } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

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

  return (
    <div>
      <div className="join">
        <LinkWrapper path={prevPath}>
          <div className={`join-item btn ${!prevPath ? 'btn-disabled' : ''}`}>
            <ChevronLeftIcon height={20} width={20} />
          </div>
        </LinkWrapper>
        <div className="join-item btn btn-disabled bg-primary text-base-content">
          {format(date, 'PPPP')}
        </div>
        <LinkWrapper path={nextPath}>
          <div className={`join-item btn ${!nextPath ? 'btn-disabled' : ''}`}>
            <ChevronRightIcon height={20} width={20} />
          </div>
        </LinkWrapper>
      </div>
    </div>
  )
}
