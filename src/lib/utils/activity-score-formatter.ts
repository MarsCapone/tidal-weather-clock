// Human-readable output types
import { ActivityScore } from '@/lib/db/helpers/activity'
import { TimeSlot } from '@/lib/score'
import { Constraint } from '@/lib/types/activity'
import { SunData, TideData, WeatherInfo, WindInfo } from '@/lib/types/context'
import { utcDateStringToUtc, utcDateToLocalTimeString } from '@/lib/utils/dates'
import { mpsToKnots } from '@/lib/utils/units'
import { describeCloudiness } from '@/lib/utils/weather-descriptions'
import { TZDate } from '@date-fns/tz'
import { isWeekend } from 'date-fns'

type ConstraintAnalysis = {
  requirement: string
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Failed'
  score: number
  details: string
}

type ReadableTimeSlot = {
  timeWindow: string
  overallScore: number
  scoreGrade: string
  conditions: {
    weather: string
    wind: string
    tides: string
    daylight: string
  }
  constraintAnalysis: ConstraintAnalysis[]
}

export default function getHumanReadableScore(
  data: ActivityScore['debug'],
): ReadableTimeSlot {
  const { timeSlot, constraintsWithScores } = data

  // Calculate overall score
  const overallScore =
    constraintsWithScores.reduce((sum, c) => sum + c.score, 0) /
    constraintsWithScores.length

  // Format time window
  const startTime = new Date(timeSlot.timestamp)
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // +1 hour
  const timeWindow = `${formatTime(startTime)} - ${formatTime(endTime)} (${formatDate(startTime)})`

  // Grade the overall score
  const scoreGrade = getScoreGrade(overallScore)

  // Format conditions
  const conditions = {
    weather: formatWeather(timeSlot.weather),
    wind: formatWind(timeSlot.wind),
    tides: formatTides(timeSlot.tide, startTime),
    daylight: formatDaylight(timeSlot.sun, startTime),
  }

  // Analyze constraints
  const constraintAnalysis = constraintsWithScores.map(
    ({ constraint, score }) => analyzeConstraint(constraint, score, timeSlot),
  )

  return {
    timeWindow,
    overallScore: Math.round(overallScore * 100) / 100,
    scoreGrade,
    conditions,
    constraintAnalysis,
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function getScoreGrade(score: number): string {
  if (score >= 0.9) {
    return 'Excellent'
  }
  if (score >= 0.7) {
    return 'Good'
  }
  if (score >= 0.5) {
    return 'Fair'
  }
  if (score >= 0.3) {
    return 'Poor'
  }
  return 'Unsuitable'
}

function formatWeather(weather: WeatherInfo): string {
  const temp = `${weather.temperature}°C`
  const clouds = describeCloudiness(weather.cloudCover)

  const precip =
    weather.precipitation! > 0 ? `, ${weather.precipitation}mm rain` : ''
  return `${temp}, ${clouds}${precip}`
}

function formatWind(wind: WindInfo): string {
  const direction = getWindDirection(wind.direction)
  const strength = getWindStrength(wind.speed)
  const gusts =
    wind.gustSpeed > wind.speed * 1.5
      ? `, gusts to ${mpsToKnots(wind.gustSpeed).toFixed(1)} kts`
      : ''

  return `${strength} ${direction} wind (${mpsToKnots(wind.speed).toFixed(1)} kts${gusts})`
}

function getWindDirection(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ]
  return directions[Math.round(degrees / 22.5) % 16]
}

function getWindStrength(speed: number): string {
  speed = mpsToKnots(speed)

  if (speed < 1) {
    return 'calm'
  }
  if (speed < 4) {
    return 'light'
  }
  if (speed < 8) {
    return 'gentle'
  }
  if (speed < 13) {
    return 'moderate'
  }
  if (speed < 19) {
    return 'fresh'
  }
  if (speed < 25) {
    return 'strong'
  }
  return 'gale'
}

function formatTides(tides: TideData, timeStart: Date): string {
  // Find tides within the next 6 hours for context
  const currentHour = timeStart.getUTCHours()
  const relevantTides = tides
    .filter((tide) => Math.abs(tide.time - currentHour) <= 3)
    .sort(
      (a, b) => Math.abs(a.time - currentHour) - Math.abs(b.time - currentHour),
    )

  if (relevantTides.length === 0) {
    return 'No significant tide changes'
  }

  const nextTide = relevantTides[0]
  const timeUntil = Math.abs(nextTide.time - currentHour)
  const timing =
    timeUntil < 1
      ? 'now'
      : timeUntil < 2
        ? `in ${Math.round(timeUntil * 60)} minutes`
        : `in ${Math.round(timeUntil)} hours`

  return `${nextTide.type} tide ${timing} (${nextTide.height.toFixed(1)}m)`
}

function formatDaylight(sun: SunData, timeStart: Date): string {
  const sunrise = new Date(sun.sunRise)
  const sunset = new Date(sun.sunSet)
  const current = timeStart

  const sunriseFormatted = utcDateToLocalTimeString(
    new TZDate(sunrise.getTime()),
  )
  const sunsetFormatted = utcDateToLocalTimeString(new TZDate(sunset.getTime()))

  if (current < sunrise) {
    const hoursUntilSunrise =
      (sunrise.getTime() - current.getTime()) / (1000 * 60 * 60)
    return `Dark (sunrise in ${hoursUntilSunrise.toFixed(1)}h at ${sunriseFormatted})`
  } else if (current > sunset) {
    return `Dark (sunset was at ${sunsetFormatted})`
  } else {
    const hoursUntilSunset =
      (sunset.getTime() - current.getTime()) / (1000 * 60 * 60)
    return `Daylight (sunset in ${hoursUntilSunset.toFixed(1)}h at ${sunsetFormatted})`
  }
}

function analyzeConstraint(
  constraint: Constraint,
  score: number,
  timeSlot: TimeSlot,
): ConstraintAnalysis {
  const status =
    score >= 0.9
      ? 'Excellent'
      : score >= 0.7
        ? 'Good'
        : score >= 0.5
          ? 'Fair'
          : score >= 0.3
            ? 'Poor'
            : 'Failed'

  if (constraint.type === 'tide') {
    return {
      requirement: `Tide: Min ${constraint.minHeight}m within ${constraint.maxHoursBefore}h before to ${constraint.maxHoursAfter}h after ${constraint.eventType} tide`,
      status,
      score,
      details:
        score === 0
          ? 'Tide requirements not met'
          : score === 1
            ? 'Perfect tide conditions'
            : 'Partially suitable tide conditions',
    }
  }

  if (constraint.type === 'sun') {
    return {
      requirement: `Daylight: Required within ${constraint.maxHoursBeforeSunset}h of sunset`,
      status,
      score,
      details:
        score === 0
          ? 'Too dark or too close to sunset'
          : score === 1
            ? 'Perfect daylight conditions'
            : 'Adequate daylight available',
    }
  }

  if (constraint.type === 'wind') {
    const actualWind = timeSlot.wind.speed
    return {
      requirement: `Wind: Maximum ${constraint.maxSpeed} mph`,
      status,
      score,
      details: `Current wind: ${actualWind.toFixed(1)} mph (${actualWind <= constraint.maxSpeed! ? 'within limit' : 'exceeds limit'})`,
    }
  }

  if (constraint.type === 'day') {
    const requirement =
      constraint.isWeekday && constraint.isWeekend
        ? 'Day: any day'
        : constraint.isWeekday && !constraint.isWeekend
          ? 'Day: any day except weekend'
          : !constraint.isWeekday && constraint.isWeekend
            ? 'Day: any day except weekday'
            : 'Day: never'
    const actualDay = utcDateStringToUtc(timeSlot.timestamp)
    return {
      requirement,
      status,
      score,
      details: `Current day is a ${isWeekend(actualDay) ? 'weekend' : 'weekday'}`,
    }
  }

  if (constraint.type === 'weather') {
    return {
      requirement: 'something about the wind',
      status,
      score,
      details: '...',
    }
  }

  return {
    requirement: `Unknown constraint: ${constraint.type}`,
    status,
    score,
    details: `Unable to analyze constraint details: ${constraint.type} constraint with score ${score.toFixed(1)}`,
  }
}
