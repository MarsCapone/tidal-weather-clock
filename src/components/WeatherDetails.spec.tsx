import {
  AggregatedDataPoint,
  WeatherDetailsInternal,
} from '@/components/WeatherDetails'
import { render } from '@testing-library/react'

const exampleData: AggregatedDataPoint[] = []

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
})
