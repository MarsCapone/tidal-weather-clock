import MainContent from '@/components/MainContent'
import { dateOptions } from '@/lib/utils/dates'
import { startOfToday } from 'date-fns'
import React from 'react'
import { getActivitiesByUserId } from '@/lib/db/helpers/activity'
import { auth0 } from '@/lib/auth0'

export default async function Page() {
  const today = startOfToday(dateOptions)
  const session = await auth0.getSession()
  // if there's a logged in user, return their activities, otherwise just return global ones
  const activities = await getActivitiesByUserId(
    session === null ? 'global' : session!.user!.email!,
  )
  return (
    <MainContent
      date={today}
      nextPath={'/plus/1'}
      prevPath={null}
      activities={activities}
    />
  )
}
