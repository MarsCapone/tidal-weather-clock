import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import WeatherOverview from './WeatherOverview'
import { exampleDataContext } from '@/lib/utils/test-data'
import { defaultWorkingHours } from '@/hooks/settings'

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
