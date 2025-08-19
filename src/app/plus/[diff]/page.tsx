import MainContent from '@/components/MainContent'
import CONSTANTS from '@/lib/constants'
import { dateOptions } from '@/lib/utils/dates'
import { addDays, startOfToday } from 'date-fns'
import { auth0 } from '@/lib/auth0'
import { getActivitiesByUserId } from '@/lib/db/helpers/activity'

export default async function Page({
  params,
}: {
  params: Promise<{ diff: string }>
}) {
  const { diff } = await params

  const today = startOfToday(dateOptions)
  const diffDays = Number.parseInt(diff)

  const prevPath =
    diffDays <= 0 ? null : diffDays === 1 ? '/' : `/plus/${diffDays - 1}`

  const nextPath =
    diffDays >= CONSTANTS.MAX_PERMITTED_DAYS
      ? `/plus/${CONSTANTS.MAX_PERMITTED_DAYS}`
      : `/plus/${diffDays + 1}`

  const date = addDays(
    today,
    diffDays <= 0
      ? 0
      : diffDays >= CONSTANTS.MAX_PERMITTED_DAYS
        ? CONSTANTS.MAX_PERMITTED_DAYS
        : diffDays,
  )

  const session = await auth0.getSession()
  // if there's a logged in user, return their activities, otherwise just return global ones
  const activities = await getActivitiesByUserId(
    session === null ? 'global' : session!.user!.email!,
  )

  return (
    <MainContent
      date={date}
      nextPath={nextPath}
      prevPath={prevPath}
      activities={activities}
    />
  )
}
