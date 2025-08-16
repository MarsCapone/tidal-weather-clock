import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import WeatherOverview from './WeatherOverview'
import { exampleDataContext } from '@/lib/utils/test-data'

describe('WeatherOverview', () => {
  test('wind / temp / cloud sections are shown', () => {
    render(<WeatherOverview dataContext={exampleDataContext} />)

    const expectedComponents = [
      'overview-wind',
      'overview-temp',
      'overview-clouds',
    ]

    for (const component of expectedComponents) {
      expect(screen.getByTestId(component)).toBeVisible()
    }
  })
})
