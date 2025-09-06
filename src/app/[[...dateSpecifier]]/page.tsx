import logger from '@/app/api/pinoLogger'
import { doRefresh, DoRefreshOptions } from '@/app/api/refresh'
import DateProvider from '@/components/date-management/DateProvider'
import MainContent, { RefreshData } from '@/components/MainContent'
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
import { addDays, isBefore, startOfToday } from 'date-fns'
import { revalidatePath } from 'next/cache'
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

  const refreshData = async (currentPath: string) => {
    'use server'
    const options = {
      scope: userId ? 'user' : ('global' as const),
      userId,
      startDate: initialDate,
      endDate: initialDate,
      refreshDataContext: true,
    }
    logger.info('Refreshing data', { options, currentPath })
    await doRefresh(options as DoRefreshOptions)
    revalidatePath(currentPath)
  }

  return (
    <DateProvider initialDate={initialDate} dataContextRange={dataContextRange}>
      <RefreshData
        lastUpdatedTime={dcLastUpdated}
        onClickedRefreshAction={refreshData}
      />
      <MainContent
        activities={activities}
        workingHours={workingHours || defaultWorkingHours}
        dataContext={dataContext}
        activityScores={activityScores}
        allActivityScores={allActivityScores}
      />
    </DateProvider>
  )
}
