'use client'

import ActivityScoreList from '@/components/ActivityScoreList'
import ClockDisplay from '@/components/ClockDisplay'
import DayTimeline from '@/components/DayTimeline'
import SuggestedActivity from '@/components/SuggestedActivity'
import { WeatherDetails } from '@/components/WeatherDetails'
import WeatherOverview from '@/components/WeatherOverview'
import { APP_CONFIG } from '@/lib/config'
import { Activity } from '@/lib/types/activity'
import { DataContext } from '@/lib/types/context'
import { WorkingHoursSetting } from '@/lib/types/settings'
import { DateContext } from '@/lib/utils/contexts'
import { dateOptions } from '@/lib/utils/dates'
import tryDataFetchersWithCache from '@/lib/utils/fetchData'
import logger from '@/lib/utils/logger'
import { EnrichedActivityScore } from '@/lib/utils/suggestions'
import { formatISO, startOfDay } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'

export default function MainContentWithoutDate({
  activities,
  workingHours,
}: {
  activities: Activity[]
  workingHours: WorkingHoursSetting
}) {
  const { showSuggestedActivity, showActivityTable } = useFlags()
  const [dataContext, setDataContext] = useState<DataContext | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [suggestions, setSuggestions] = useState<EnrichedActivityScore[]>([])
  const [allSuggestions, setAllSuggestions] = useState<any[]>([])
  const [selectionIndex, setSelectionIndex] = useState(0)
  const { date } = useContext(DateContext)

  useEffect(() => {
    tryDataFetchersWithCache(
      logger,
      startOfDay(date, dateOptions),
      APP_CONFIG.dataFetchers,
      APP_CONFIG.clientCache,
      (lat, lng, date) =>
        `[${lat},${lng}]-${formatISO(date, { representation: 'date' })}`,
    ).then((dc) => {
      if (dc === null) {
        logger.warn('final data context is null')
      }
      logger.info('setting data context', { dataContext: dc })
      setDataContext(dc)
      setIsLoading(false)
    })
  }, [date])

  // Fetch suggestions from the backend API when dataContext, activities, or workingHours change
  useEffect(() => {
    if (!dataContext) return

    const fetchSuggestions = async () => {
      try {
        setIsLoading(true)
        const dateString = formatISO(date, { representation: 'date' })

        // Prepare query parameters
        const params = new URLSearchParams()
        params.append('activities', JSON.stringify(activities))
        params.append('workingHours', JSON.stringify(workingHours))
        params.append('groupBy', 'timeAndActivity')

        // Fetch suggestions from the API
        const response = await fetch(
          `/api/suggestions/${dateString}?${params.toString()}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.statusText}`)
        }

        const data = await response.json()
        setSuggestions(data.suggestions)
        setAllSuggestions(data.allSuggestions)
        setSelectionIndex(0) // Reset selection index when suggestions change
      } catch (error) {
        logger.error('Error fetching suggestions', { error })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [dataContext, activities, workingHours, date])

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl">Loading data...</h1>
        <span className="loading loading-dots loading-lg"></span>
      </>
    )
  }

  if (dataContext === null || dataContext === undefined) {
    return (
      <>
        <h1 className="text-3xl">No data context available</h1>
        <button className="btn btn-warning rounded-md">
          <Link href="/">Back to Today</Link>
        </button>
      </>
    )
  }

  const suggestedActivity =
    suggestions.length > 0 ? suggestions[selectionIndex] : null

  const nextSuggestion = () =>
    setSelectionIndex(Math.min(suggestions.length - 1, selectionIndex + 1))
  const prevSuggestion = () =>
    setSelectionIndex(Math.max(0, selectionIndex - 1))

  return (
    <>
      <div>
        {showSuggestedActivity && (
          <SuggestedActivity
            activityScore={suggestedActivity}
            className={'md:hidden'}
            nextSuggestion={
              selectionIndex < filteredSuggestions.length - 1
                ? nextSuggestion
                : undefined
            }
            prevSuggestion={selectionIndex > 0 ? prevSuggestion : undefined}
          />
        )}
        <div className="flex flex-col items-start justify-center gap-6 md:flex-row">
          <div className="w-full">
            <DayTimeline
              referenceDate={dataContext.referenceDate}
              sunData={dataContext.sunData}
              tideData={dataContext.tideData}
            />
            <WeatherOverview
              dataContext={dataContext}
              workingHours={workingHours}
            />
            <ClockDisplay
              suggestedActivity={suggestedActivity}
              dataContext={dataContext}
            />
            <WeatherDetails
              dataContext={dataContext}
              workingHours={workingHours}
            />
          </div>
        </div>
        {showActivityTable && showSuggestedActivity && (
          <div className="my-8">
            <ActivityScoreList scores={allSuggestions} />
          </div>
        )}
      </div>
    </>
  )
}
