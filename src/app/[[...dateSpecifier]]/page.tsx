import MainContent from '@/components/MainContent'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { addDays, startOfToday } from 'date-fns'
import React from 'react'
import { getActivitiesByUserId } from '@/lib/db/helpers/activity'
import { auth0 } from '@/lib/auth0'
import App from '@/components/App'
import MainContentWithoutDate from '@/components/MainContent'
import DateProvider from '@/components/date-management/DateProvider'
import { notFound } from 'next/navigation'
import { TZDate } from '@date-fns/tz'

export default async function Page({
  params,
}: {
  params: Promise<{ dateSpecifier?: string[] }>
}) {
  const { dateSpecifier } = await params
  const today = startOfToday(dateOptions)

  if (dateSpecifier === undefined) {
    return <PageContent initialDate={today} />
  }

  if (dateSpecifier.length !== 2) {
    return notFound()
  }

  const [action, val] = dateSpecifier

  if (action === 'static') {
    // parse val as date
    return <PageContent initialDate={utcDateStringToUtc(val)} />
  }

  if (action === 'plus') {
    const diff = Number.parseInt(val)
    return <PageContent initialDate={addDays(today, diff)} />
  }

  if (action === 'minus') {
    const diff = Number.parseInt(val)
    return <PageContent initialDate={addDays(today, diff * -1)} />
  }

  return notFound()
}

async function PageContent({ initialDate }: { initialDate: TZDate }) {
  const session = await auth0.getSession()
  const activities = await getActivitiesByUserId(
    session === null ? 'global' : session!.user!.email!,
    true,
  )

  return (
    <DateProvider initialDate={initialDate}>
      <MainContentWithoutDate activities={activities} />
    </DateProvider>
  )
}
