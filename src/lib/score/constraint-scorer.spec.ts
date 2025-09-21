import { TimeSlot } from '@/lib/score/index'
import { DefaultConstraintScorer } from './constraint-scorer'

describe('DefaultConstraintScorer', () => {
  const timeSlot: TimeSlot = {
    timestamp: '2025-09-21T17:00:00Z',
    fractionalHour: 17,
    sun: {
      sunRise: '2025-09-21T05:42',
      sunSet: '2025-09-21T17:58',
    },
    tide: [
      {
        height: 2.1438790738063767,
        time: 6.216666666666667,
        timestamp: '2025-09-21T06:13:15',
        type: 'high',
      },
      {
        height: 2.016347624945517,
        time: 18.95,
        timestamp: '2025-09-21T18:57:26.667',
        type: 'high',
      },
      {
        height: 0,
        time: 12.583333333333332,
        timestamp: '2025-09-21T12:35:00Z',
        type: 'low',
      },
      {
        height: 0,
        time: 0.21666666666666679,
        timestamp: '2025-09-21T00:13:00Z',
        type: 'low',
      },
    ],
    wind: {
      direction: 347,
      gustSpeed: 9.7,
      speed: 9.34,
      timestamp: '2025-09-21T17:00',
    },
    weather: {
      cloudCover: 6,
      precipitation: 0,
      precipitationProbability: 13,
      rain: 0,
      sunshineDuration: 3600,
      temperature: 12.5,
      timestamp: '2025-09-21T17:00',
      uvIndex: 0.8,
    },
  }
  const scorer = new DefaultConstraintScorer(timeSlot)

  describe('Day Score', () => {
    it('should score 1 if the constraint is any day', () => {
      expect(
        scorer.getDayScore({
          type: 'day',
          isWeekday: true,
          isWeekend: true,
        }),
      ).toBe(1)
    })

    it('should score 1 if there are no constraints', () => {
      expect(scorer.getDayScore({ type: 'day' })).toBe(1)
    })

    it('should score 0 if the constraint is a weekday but the slot is a weekend', () => {
      expect(
        scorer.getDayScore({
          type: 'day',
          isWeekday: true,
        }),
      ).toBe(0)
    })
  })
})
