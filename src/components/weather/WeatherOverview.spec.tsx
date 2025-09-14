import { defaultWorkingHours } from '@/lib/types/settings'
import { exampleDataContext } from '@/lib/utils/test-data'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import WeatherOverview from './WeatherOverview'

describe('WeatherOverview', () => {
  test('wind / temp / cloud sections are shown', () => {
    render(
      <WeatherOverview
        dataContext={exampleDataContext}
        workingHours={defaultWorkingHours}
      />,
    )

    const expectedComponents = [
      'overview-wind',
      'overview-wind-direction',
      'overview-temp',
      'overview-clouds',
    ]

    for (const component of expectedComponents) {
      expect(screen.getByTestId(component)).toBeVisible()
    }
  })
})
