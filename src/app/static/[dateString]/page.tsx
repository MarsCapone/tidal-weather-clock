import MainContent from '@/components/MainContent'
import { dateOptions } from '@/lib/utils/dates'
import { addDays, formatISO, FormatISOOptions, parseISO } from 'date-fns'
import { auth0 } from '@/lib/auth0'
import { getActivitiesByUserId } from '@/lib/db/helpers/activity'

export default async function Page({
  params,
}: {
  params: Promise<{ dateString: string }>
}) {
  const { dateString } = await params

  const formatOptions = { representation: 'date' } as FormatISOOptions
  const date = parseISO(dateString, dateOptions)

  const session = await auth0.getSession()
  // if there's a logged in user, return their activities, otherwise just return global ones
  const activities = await getActivitiesByUserId(
    session === null ? 'global' : session!.user!.email!,
  )
  return (
    <MainContent
      date={date}
      nextPath={`/static/${formatISO(addDays(date, 1), formatOptions)}`}
      prevPath={`/static/${formatISO(addDays(date, -1), formatOptions)}`}
      activities={activities}
    />
  )
}
