import DateProvider from '@/components/date-management/DateProvider'
import MainContentWithoutDate from '@/components/MainContent'
import { getUserId } from '@/lib/auth0'
import CONSTANTS from '@/lib/constants'
import { getActivitiesByUserId } from '@/lib/db/helpers/activity'
import { getDataContextRange } from '@/lib/db/helpers/datacontext'
import { getOrPutSetting } from '@/lib/db/helpers/settings'
import { defaultWorkingHours, WorkingHoursSetting } from '@/lib/types/settings'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { TZDate } from '@date-fns/tz'
import { addDays, startOfToday } from 'date-fns'
import { notFound } from 'next/navigation'
import React from 'react'

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
  const userId = await getUserId()

  const activities = await getActivitiesByUserId(userId || 'global', true)
  const dataContextRange = await getDataContextRange(CONSTANTS.LOCATION_COORDS)
  const workingHours = await getOrPutSetting<WorkingHoursSetting>(
    'working_hours',
    userId,
    defaultWorkingHours,
  )

  return (
    <DateProvider initialDate={initialDate} dataContextRange={dataContextRange}>
      <MainContentWithoutDate
        activities={activities}
        workingHours={workingHours || defaultWorkingHours}
      />
    </DateProvider>
  )
}
