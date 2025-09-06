import DateProvider from '@/components/date-management/DateProvider'
import MainContentWithoutDate from '@/components/MainContent'
import { getUserId } from '@/lib/auth0'
import CONSTANTS from '@/lib/constants'
import {
  getActivitiesByUserId,
  getBestActivitiesForDatacontext,
} from '@/lib/db/helpers/activity'
import {
  getDataContextByDate,
  getDataContextRange,
} from '@/lib/db/helpers/datacontext'
import { getOrPutSetting } from '@/lib/db/helpers/settings'
import { defaultWorkingHours, WorkingHoursSetting } from '@/lib/types/settings'
import { dateOptions, utcDateStringToUtc } from '@/lib/utils/dates'
import { TZDate } from '@date-fns/tz'
import { addDays, formatISO, isBefore, startOfToday } from 'date-fns'
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
    userId || 'global',
    defaultWorkingHours,
  )
  const {
    id: dataContextId,
    dataContext,
    lastUpdated: dcLastUpdated,
  } = (await getDataContextByDate(initialDate, CONSTANTS.LOCATION_COORDS)) || {}

  const dateIsInThePast = isBefore(initialDate, startOfToday(dateOptions))

  async function getActivityScoresWithThreshhold(scoreThreshold: number) {
    return dataContextId !== undefined
      ? await getBestActivitiesForDatacontext(
          dataContextId,
          [userId || 'global', 'global'],
          {
            futureOnly: !dateIsInThePast, // todo: add a setting for these
            scoreThreshold,
          },
        )
      : []
  }

  const activityScores = await getActivityScoresWithThreshhold(0.5)
  const allActivityScores = await getActivityScoresWithThreshhold(0)

  return (
    <DateProvider initialDate={initialDate} dataContextRange={dataContextRange}>
      <div className="flex flex-row items-end justify-end text-xs">
        {dataContextId && `data-context-id: ${dataContextId} `}
        {dcLastUpdated && `| last-updated: ${formatISO(dcLastUpdated)}`}
      </div>
      <MainContentWithoutDate
        activities={activities}
        workingHours={workingHours || defaultWorkingHours}
        dataContext={dataContext}
        activityScores={activityScores}
        allActivityScores={allActivityScores}
      />
    </DateProvider>
  )
}
