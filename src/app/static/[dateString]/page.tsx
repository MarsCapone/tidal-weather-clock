import MainContent from '@/components/MainContent'
import { dateOptions } from '@/lib/utils/dates'
import { addDays, formatISO, FormatISOOptions, parseISO } from 'date-fns'

export default async function Page({
  params,
}: {
  params: Promise<{ dateString: string }>
}) {
  const { dateString } = await params

  const formatOptions = { representation: 'date' } as FormatISOOptions
  const date = parseISO(dateString, dateOptions)

  return (
    <MainContent
      date={date}
      nextPath={`/static/${formatISO(addDays(date, 1), formatOptions)}`}
      prevPath={`/static/${formatISO(addDays(date, -1), formatOptions)}`}
    />
  )
}
