import { getDataContextForDateString } from '@/app/api/dataContext/[dateString]/route'
import logger from '@/app/api/pinoLogger'
import { Activity } from '@/lib/types/activity'
import { WorkingHoursSetting } from '@/lib/types/settings'
import { utcDateStringToUtc } from '@/lib/utils/dates'
import { ActivityRecommender, groupScores } from '@/lib/utils/suggestions'
import { startOfDay } from 'date-fns'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dateString: string }> },
) {
  const { dateString } = await params
  const searchParams = request.nextUrl.searchParams
  const groupByType = (searchParams.get('groupBy') || 'timeAndActivity') as
    | 'none'
    | 'time'
    | 'timeAndActivity'

  // Get activities from query params (should be JSON stringified)
  const activitiesParam = searchParams.get('activities')
  let activities: Activity[] = []
  try {
    if (activitiesParam) {
      activities = JSON.parse(activitiesParam) as Activity[]
    }
  } catch (error) {
    logger.error('Failed to parse activities', { error })
    return Response.json(
      { error: 'Invalid activities parameter' },
      { status: 400 },
    )
  }

  // Get working hours from query params (should be JSON stringified)
  const workingHoursParam = searchParams.get('workingHours')
  let workingHours: WorkingHoursSetting = null
  try {
    if (workingHoursParam) {
      workingHours = JSON.parse(workingHoursParam) as WorkingHoursSetting
    }
  } catch (error) {
    logger.error('Failed to parse workingHours', { error })
    return Response.json(
      { error: 'Invalid workingHours parameter' },
      { status: 400 },
    )
  }

  const date = startOfDay(utcDateStringToUtc(dateString))
  const dataContext = await getDataContextForDateString(date)

  if (!dataContext) {
    return Response.json(
      { error: 'No data context available for the given date' },
      { status: 404 },
    )
  }

  // Generate suggestions using the ActivityRecommender
  const recommender = new ActivityRecommender(dataContext, workingHours)
  const suggestions = recommender.getRecommendedActivities(activities)

  // Filter and group suggestions
  const filteredSuggestions = groupScores(
    suggestions.filter((r) => r.feasible),
    groupByType,
  )

  return Response.json({
    suggestions: filteredSuggestions,
    allSuggestions: suggestions,
  })
}
