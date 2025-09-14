import logger from '@/app/api/pinoLogger'
import { DefaultConstraintScorer } from '@/lib/score/constraint-scorer'
import { Constraint, TActivity } from '@/lib/types/activity'
import {
  DataContext,
  SunData,
  TideData,
  WeatherInfo,
  WindInfo,
} from '@/lib/types/context'
import {
  dateOptions,
  naiveDateToFractionalUtc,
  utcDateStringToUtc,
} from '@/lib/utils/dates'
import { uploadDebugData } from '@/lib/utils/debug'
import { calcMean } from '@/lib/utils/math'
import { eachHourOfInterval, endOfDay, formatISO, startOfDay } from 'date-fns'

type GetScoreParams = {
  dataContext: DataContext
  activity: TActivity
}

type GetScoreResult<DebugType> = {
  timestamp: string
  value: number
  debug: DebugType
}[]

export type TimeSlot = {
  timestamp: string
  fractionalHour: number

  wind: WindInfo
  weather: WeatherInfo
  sun: SunData
  tide: TideData
}

export async function getScores({
  dataContext,
  activity,
}: GetScoreParams): Promise<
  GetScoreResult<{
    timeSlot: TimeSlot
    constraintsWithScores: { constraint: Constraint; score: number }[]
  }>
> {
  /**
   * Given a data context and an activity calculate the scores for each available timeslot.
   * Time slots that are missing data are skipped.
   */
  const refDate = utcDateStringToUtc(dataContext.referenceDate)
  const hoursOfDay = eachHourOfInterval(
    {
      start: startOfDay(refDate),
      end: endOfDay(refDate),
    },
    dateOptions,
  )

  const timeSlots: TimeSlot[] = hoursOfDay
    .map((h) => {
      const hourTimestamp = formatISO(h, dateOptions)
      const wind = dataContext.windData.points.find(({ timestamp }) =>
        hourTimestamp.startsWith(timestamp),
      )
      const weather = dataContext.weatherData.points.find(({ timestamp }) =>
        hourTimestamp.startsWith(timestamp),
      )
      if (wind === undefined || weather === undefined) {
        logger.warn('Not enough data to build timeslot', {
          hour: h,
          wind: dataContext.windData.points.map(({ timestamp }) => timestamp),
          weather: dataContext.weatherData.points.map(
            ({ timestamp }) => timestamp,
          ),
        })
        return null
      }

      return {
        timestamp: formatISO(h, dateOptions),
        fractionalHour: naiveDateToFractionalUtc(h),
        sun: dataContext.sunData,
        tide: dataContext.tideData,
        wind,
        weather,
      }
    })
    .filter((t) => t !== null)

  const scores = timeSlots.map((timeSlot) => {
    const scorer = new DefaultConstraintScorer(timeSlot)
    const constraintScores = activity.constraints.map((c) => {
      switch (c.type) {
        case 'sun':
          return scorer.getSunScore(c)
        case 'weather':
          return scorer.getWeatherScore(c)
        case 'wind':
          return scorer.getWindScore(c)
        case 'tide':
          return scorer.getTideScore(c)
        case 'time':
          return scorer.getTimeScore(c)
        case 'day':
          return scorer.getDayScore(c)
        default:
          throw new Error('unknown constraint type')
      }
    })

    const constraintsWithScores = activity.constraints.map(
      (constraint, index) => ({
        constraint,
        score: constraintScores[index],
      }),
    )

    // if any constraint score is 0, then the activity is not possible, so the entire score should be 0
    // but if there are no constraints, then the activity is always possible, so the score should be 1
    const finalScore = constraintScores.some((s) => s === 0)
      ? 0
      : constraintScores.length === 0
        ? 1
        : calcMean(constraintScores)

    return {
      timestamp: timeSlot.timestamp,
      value: finalScore,
      debug: {
        timeSlot,
        constraintsWithScores,
      },
    }
  })

  await uploadDebugData(
    'activityScore',
    `activity_score_calculation-${activity.id}@v${activity.version}.json`,
    {
      dataContext,
      activity,
      scores,
    },
  )

  return scores
}
