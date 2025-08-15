import {
  AggregatedDataPoint,
  WeatherDetailsInternal,
} from '@/components/WeatherDetails'
import { utcDateStringToLocalTimeString } from '@/utils/dates'
import { fireEvent, render, screen } from '@testing-library/react'

const exampleData: AggregatedDataPoint[] = [
  // 08:00
  {
    cloudCover: 14,
    precipitation: 0,
    precipitationProbability: 0,
    rain: 0,
    sunshineDuration: 3600,
    temperature: 18.3,
    timestamp: '2025-08-15T08:00',
    uvIndex: 2.2,
    direction: 333,
    gustSpeed: 3.9,
    speed: 3.26,
  },
  // 09:00
  {
    cloudCover: 15,
    precipitation: 0,
    precipitationProbability: 0,
    rain: 0,
    sunshineDuration: 3600,
    temperature: 18.6,
    timestamp: '2025-08-15T09:00',
    uvIndex: 3.4,
    direction: 348,
    gustSpeed: 4.3,
    speed: 3.88,
  },
  // 10:00
  {
    cloudCover: 7,
    precipitation: 0,
    precipitationProbability: 0,
    rain: 0,
    sunshineDuration: 3600,
    temperature: 18.1,
    timestamp: '2025-08-15T10:00',
    uvIndex: 4.55,
    direction: 1,
    gustSpeed: 5.6,
    speed: 5.8,
  },
  // 17:00
  {
    cloudCover: 24,
    precipitation: 0,
    precipitationProbability: 0,
    rain: 0,
    sunshineDuration: 3600,
    temperature: 16.8,
    timestamp: '2025-08-15T17:00',
    uvIndex: 2.2,
    direction: 31,
    gustSpeed: 8.1,
    speed: 6.28,
  },
]

describe('WeatherDetails', () => {
  beforeEach(() => {
    render(
      <WeatherDetailsInternal
        aggregatedDataPoints={exampleData}
        workingHours={{
          startHour: 9,
          endHour: 17,
          enabled: true,
        }}
      />,
    )
  })

  test('on load, only working hours are visible', () => {
    const hours = exampleData
      .slice(1, 3)
      .map((e) => utcDateStringToLocalTimeString(e.timestamp))

    expect(
      screen.getAllByTestId('timestamp-data').map((t) => t.textContent),
    ).toEqual(hours)
  })

  test('if the toggle is clicked, all hours are visible', () => {
    const toggle = screen.getByTestId('ooh-toggle')
    fireEvent.click(toggle)

    const hours = exampleData.map((e) =>
      utcDateStringToLocalTimeString(e.timestamp),
    )
    expect(
      screen.getAllByTestId('timestamp-data').map((t) => t.textContent),
    ).toEqual(hours)
  })

  test('expected columns are visible', () => {
    const columns = [
      'Time',
      'Wind Speed',
      'Gusts',
      'Temperature',
      'Cloudiness',
      'UV Index',
    ]

    for (const column of columns) {
      expect(screen.getByText(column)).toBeVisible()
    }
  })
})

describe('WeatherDetails w/o Working Hours', () => {
  beforeEach(() => {
    render(
      <WeatherDetailsInternal
        aggregatedDataPoints={exampleData}
        workingHours={{
          startHour: 9,
          endHour: 17,
          enabled: false,
        }}
      />,
    )
  })

  test('Show/Hide OOH not visible', () => {
    expect(screen.queryByText('Hide Out of Hours')).toBeNull()
  })

  test('there is no filtering on the visible hours', () => {
    const expectedHours = exampleData.map((e) =>
      utcDateStringToLocalTimeString(e.timestamp),
    )
    // in BST all hours will be shifted by one

    expect(
      screen.getAllByTestId('timestamp-data').map((t) => t.textContent),
    ).toEqual(expectedHours)
  })
})
