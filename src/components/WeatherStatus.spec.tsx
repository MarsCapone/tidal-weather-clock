import { exampleDataContext } from '@/utils/test-data'
import { render, screen } from '@testing-library/react'
import React from 'react'
import WeatherStatus from './WeatherStatus'

const expectedStatuses = [
  'Wind',
  'Temperature',
  'Cloudiness',
  'Sunrise',
  'Sunset',
  'HW',
  'LW',
]

describe('WeatherStatus', () => {
  beforeEach(() => {
    render(<WeatherStatus dataContext={exampleDataContext} />)
  })

  test('expected statuses are shown', () => {
    const labels = screen.getAllByTestId('weather-status-label')

    expect(labels.map((l) => l.textContent)).toEqual(expectedStatuses)
  })

  test('expected windiness', () => {
    expect(screen.getByTestId('Wind-value')).toHaveTextContent('11.3 kts')
    expect(screen.getByTestId('Wind-value')).toHaveTextContent('NE (48º)')
  })

  test('expected temperature', () => {
    expect(screen.getByTestId('Temperature-value')).toHaveTextContent('16.9ºC')
  })

  test('expected cloudiness', () => {
    expect(screen.getByTestId('Cloudiness-value')).toHaveTextContent('Overcast')
  })

  test('expected sunrise and sunset', () => {
    expect(screen.getByTestId('Sunrise-value')).toHaveTextContent('05:44')
    expect(screen.getByTestId('Sunset-value')).toHaveTextContent('20:17')
  })

  test('expected high and low waters', () => {
    const hwValue = screen.getByTestId('HW-value')

    expect(hwValue).toHaveTextContent('02:09')
    expect(hwValue).toHaveTextContent('(0.8 m)')

    const lwValue = screen.getByTestId('LW-value')

    expect(lwValue).toHaveTextContent('08:28')
    expect(lwValue).toHaveTextContent('approx.')
  })
})
