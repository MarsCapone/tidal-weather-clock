// Environmental data types (matching your input format)
interface WindPoint {
  direction: number // degrees
  gustSpeed: number // m/s
  speed: number // m/s
  timestamp: string
}

interface WeatherPoint {
  cloudCover: number // percentage
  temperature: number // celsius
  timestamp: string
}

interface TidePoint {
  height: number // meters
  time: number // hours from midnight
  type: 'high' | 'low'
}

interface SunData {
  sunRise: string
  sunSet: string
}

interface EnvironmentalData {
  referenceDate: string
  sunData: SunData
  tideData: TidePoint[]
  weatherData: { points: WeatherPoint[] }
  windData: { points: WindPoint[] }
}

// Constraint types
interface WindConstraint {
  directionTolerance?: number // tolerance in degrees for preferred directions
  maxGustSpeed?: number
  maxSpeed?: number
  minSpeed?: number
  preferredDirections?: number[] // array of preferred wind directions in degrees
  type: 'wind'
}

interface WeatherConstraint {
  maxCloudCover?: number
  maxTemperature?: number
  minTemperature?: number
  type: 'weather'
}

interface TideConstraint {
  maxHeight?: number
  minHeight?: number
  preferredStates?: ('high' | 'low' | 'rising' | 'falling')[]
  timeFromTideEvent?: {
    event: 'high' | 'low'
    maxHoursAfter?: number
    maxHoursBefore?: number
  }
  type: 'tide'
}

interface SunConstraint {
  maxHoursBeforeSunset?: number
  minHoursAfterSunrise?: number
  requiresDarkness?: boolean
  requiresDaylight?: boolean
  type: 'sun'
}

interface TimeConstraint {
  earliestHour?: number // 24hr format
  latestHour?: number
  preferredHours?: number[]
  type: 'time'
}

type Constraint =
  | WindConstraint
  | WeatherConstraint
  | TideConstraint
  | SunConstraint
  | TimeConstraint

// Activity definition
interface Activity {
  constraints: Constraint[]
  description: string
  duration: number // hours
  id: string
  name: string
  priority: number // 1-10, higher is more important
}

// Scoring and recommendation types
interface ActivityScore {
  activity: Activity
  constraintScores: { [constraintType: string]: number }
  feasible: boolean
  score: number // 0-100
  timestamp: string
}

interface TimeSlot {
  hour: number
  isDaylight: boolean
  tideState: {
    current: TidePoint | null
    height: number
    next: TidePoint | null
    state: 'rising' | 'falling' | 'high' | 'low'
  }
  timestamp: string
  weather: WeatherPoint
  wind: WindPoint
}

// Main recommendation engine
class ActivityRecommender {
  private data: EnvironmentalData
  private timeSlots: TimeSlot[]

  constructor(data: EnvironmentalData) {
    this.data = data
    this.timeSlots = this.generateTimeSlots()
  }

  private generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = []
    const refDate = new Date(this.data.referenceDate)
    const sunRise = new Date(this.data.sunData.sunRise)
    const sunSet = new Date(this.data.sunData.sunSet)

    // Generate hourly slots for the day
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(refDate.getTime() + hour * 60 * 60 * 1000)
      const timestampStr = timestamp.toISOString()

      // Find corresponding wind and weather data
      const wind = this.data.windData.points.find(
        (p) => p.timestamp === timestampStr,
      )
      const weather = this.data.weatherData.points.find(
        (p) => p.timestamp === timestampStr,
      )

      if (wind && weather) {
        const tideState = this.calculateTideState(hour)
        const isDaylight = timestamp >= sunRise && timestamp <= sunSet

        slots.push({
          hour,
          isDaylight,
          tideState,
          timestamp: timestampStr,
          weather,
          wind,
        })
      }
    }

    return slots
  }

  private calculateTideState(hour: number): TimeSlot['tideState'] {
    const tides = [...this.data.tideData].sort((a, b) => a.time - b.time)

    let current: TidePoint | null = null
    let next: TidePoint | null = null

    for (let i = 0; i < tides.length; i++) {
      if (tides[i].time <= hour) {
        current = tides[i]
        next = tides[i + 1] || null
      } else {
        next = tides[i]
        break
      }
    }

    let state: 'rising' | 'falling' | 'high' | 'low' = 'rising'
    let height = 0

    if (current && next) {
      // Interpolate tide height
      const timeDiff = next.time - current.time
      const hoursSinceCurrent = hour - current.time
      const ratio = hoursSinceCurrent / timeDiff
      height = current.height + (next.height - current.height) * ratio

      // Determine state
      if (Math.abs(hoursSinceCurrent) < 0.5) {
        state = current.type
      } else if (Math.abs(hour - next.time) < 0.5) {
        state = next.type
      } else {
        state = current.type === 'high' ? 'falling' : 'rising'
      }
    }

    return { current, height, next, state }
  }

  private scoreConstraint(constraint: Constraint, slot: TimeSlot): number {
    switch (constraint.type) {
      case 'wind':
        return this.scoreWindConstraint(constraint, slot)
      case 'weather':
        return this.scoreWeatherConstraint(constraint, slot)
      case 'tide':
        return this.scoreTideConstraint(constraint, slot)
      case 'sun':
        return this.scoreSunConstraint(constraint, slot)
      case 'time':
        return this.scoreTimeConstraint(constraint, slot)
      default:
        return 50 // neutral score
    }
  }

  private scoreWindConstraint(
    constraint: WindConstraint,
    slot: TimeSlot,
  ): number {
    const { wind } = slot
    let score = 100

    if (constraint.minSpeed && wind.speed < constraint.minSpeed) {
      score = 0
    }
    if (constraint.maxSpeed && wind.speed > constraint.maxSpeed) {
      score = 0
    }
    if (constraint.maxGustSpeed && wind.gustSpeed > constraint.maxGustSpeed) {
      score = 0
    }

    if (constraint.preferredDirections && constraint.directionTolerance) {
      const tolerance = constraint.directionTolerance
      const isDirectionGood = constraint.preferredDirections.some(
        (preferredDir) => {
          const diff = Math.abs(wind.direction - preferredDir)
          return diff <= tolerance || diff >= 360 - tolerance
        },
      )
      if (!isDirectionGood) {
        score *= 0.5
      }
    }

    return score
  }

  private scoreWeatherConstraint(
    constraint: WeatherConstraint,
    slot: TimeSlot,
  ): number {
    const { weather } = slot
    let score = 100

    if (
      constraint.maxCloudCover &&
      weather.cloudCover > constraint.maxCloudCover
    ) {
      score *= Math.max(
        0,
        1 - (weather.cloudCover - constraint.maxCloudCover) / 50,
      )
    }

    if (
      constraint.minTemperature &&
      weather.temperature < constraint.minTemperature
    ) {
      score = 0
    }
    if (
      constraint.maxTemperature &&
      weather.temperature > constraint.maxTemperature
    ) {
      score = 0
    }

    return score
  }

  private scoreTideConstraint(
    constraint: TideConstraint,
    slot: TimeSlot,
  ): number {
    const { tideState } = slot
    let score = 100

    if (
      constraint.preferredStates &&
      !constraint.preferredStates.includes(tideState.state)
    ) {
      score *= 0.3
    }

    if (constraint.minHeight && tideState.height < constraint.minHeight) {
      score = 0
    }
    if (constraint.maxHeight && tideState.height > constraint.maxHeight) {
      score = 0
    }

    if (constraint.timeFromTideEvent && tideState.current) {
      const hoursSinceEvent = slot.hour - tideState.current.time
      const {
        event,
        maxHoursAfter = 24,
        maxHoursBefore = 24,
      } = constraint.timeFromTideEvent

      if (tideState.current.type === event) {
        if (
          hoursSinceEvent < -maxHoursBefore ||
          hoursSinceEvent > maxHoursAfter
        ) {
          score *= 0.2
        }
      }
    }

    return score
  }

  private scoreSunConstraint(
    constraint: SunConstraint,
    slot: TimeSlot,
  ): number {
    let score = 100

    if (constraint.requiresDaylight && !slot.isDaylight) {
      score = 0
    }
    if (constraint.requiresDarkness && slot.isDaylight) {
      score = 0
    }

    // Additional sun timing constraints would go here
    return score
  }

  private scoreTimeConstraint(
    constraint: TimeConstraint,
    slot: TimeSlot,
  ): number {
    let score = 100

    if (constraint.earliestHour && slot.hour < constraint.earliestHour) {
      score = 0
    }
    if (constraint.latestHour && slot.hour > constraint.latestHour) {
      score = 0
    }

    if (constraint.preferredHours) {
      if (constraint.preferredHours.includes(slot.hour)) {
        score = 100
      } else {
        // Find closest preferred hour
        const closest = constraint.preferredHours.reduce((prev, curr) =>
          Math.abs(curr - slot.hour) < Math.abs(prev - slot.hour) ? curr : prev,
        )
        const distance = Math.abs(closest - slot.hour)
        score = Math.max(20, 100 - distance * 10)
      }
    }

    return score
  }

  public recommendActivities(activities: Activity[]): ActivityScore[] {
    const recommendations: ActivityScore[] = []

    activities.forEach((activity) => {
      this.timeSlots.forEach((slot) => {
        const constraintScores: { [key: string]: number } = {}
        let totalScore = 0
        let feasible = true

        activity.constraints.forEach((constraint, index) => {
          const score = this.scoreConstraint(constraint, slot)
          constraintScores[`${constraint.type}_${index}`] = score
          totalScore += score
          if (score === 0) {
            feasible = false
          }
        })

        const averageScore =
          activity.constraints.length > 0
            ? totalScore / activity.constraints.length
            : 50
        const priorityBonus = activity.priority * 2
        const finalScore = Math.min(100, averageScore + priorityBonus)

        recommendations.push({
          activity,
          constraintScores,
          feasible,
          score: finalScore,
          timestamp: slot.timestamp,
        })
      })
    })

    return recommendations.sort((a, b) => b.score - a.score)
  }

  public getBestActivityForTime(
    activities: Activity[],
    targetHour: number,
  ): ActivityScore | null {
    const slot = this.timeSlots.find((s) => s.hour === targetHour)
    if (!slot) {
      return null
    }

    const recommendations = this.recommendActivities(activities)
    const timeSpecificRecs = recommendations.filter((r) => {
      const recHour = new Date(r.timestamp).getHours()
      return recHour === targetHour && r.feasible
    })

    return timeSpecificRecs.length > 0 ? timeSpecificRecs[0] : null
  }
}

// Example usage and activity definitions
const exampleActivities: Activity[] = [
  {
    constraints: [
      { maxGustSpeed: 20, maxSpeed: 15, minSpeed: 2, type: 'wind' },
      { maxCloudCover: 80, type: 'weather' },
      { requiresDaylight: true, type: 'sun' },
      { earliestHour: 8, latestHour: 18, type: 'time' },
    ],
    description: 'Recreational sailing',
    duration: 3,
    id: 'sailing',
    name: 'Sailing',
    priority: 7,
  },
  {
    constraints: [
      { preferredStates: ['rising', 'high'], type: 'tide' },
      {
        directionTolerance: 45,
        maxSpeed: 12,
        preferredDirections: [270, 225],
        type: 'wind',
      },
      { requiresDaylight: true, type: 'sun' },
      { minTemperature: 12, type: 'weather' },
    ],
    description: 'Surf session',
    duration: 2,
    id: 'surfing',
    name: 'Surfing',
    priority: 8,
  },
  {
    constraints: [
      { requiresDarkness: true, type: 'sun' },
      { maxCloudCover: 30, type: 'weather' },
      { maxSpeed: 8, type: 'wind' },
      { earliestHour: 21, type: 'time' },
    ],
    description: 'Astronomical observation',
    duration: 2,
    id: 'stargazing',
    name: 'Stargazing',
    priority: 5,
  },
  {
    constraints: [
      { preferredStates: ['rising', 'falling'], type: 'tide' },
      { maxSpeed: 10, type: 'wind' },
      { preferredHours: [6, 7, 18, 19, 20], type: 'time' },
    ],
    description: 'Shore fishing',
    duration: 4,
    id: 'fishing',
    name: 'Fishing',
    priority: 6,
  },
]

export {
  ActivityRecommender,
  exampleActivities,
  type Activity,
  type Constraint,
  type ActivityScore,
}
