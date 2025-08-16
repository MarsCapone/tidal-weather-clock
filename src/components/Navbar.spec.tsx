import Navbar from '@/components/Navbar'
import CONSTANTS from '@/lib/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, test, beforeEach, expect } from 'vitest'

describe('Navbar', () => {
  beforeEach(() => {
    render(<Navbar />)
  })

  test('shows the title', () => {
    expect(screen.getByText(CONSTANTS.TITLE)).toBeInTheDocument()
  })

  test('has a link to settings', () => {
    const settings = screen.getByRole('link', { name: 'Settings' })

    expect(settings).toBeVisible()
    expect(settings).toHaveAttribute('href', '/settings')
  })

  test('shows the colorscheme switcher', () => {
    const switcher = screen.getByRole('checkbox')

    expect(switcher).toBeInTheDocument()
    expect(switcher).toHaveAttribute('id', 'theme-controller')
  })

  test('colorscheme switcher works', () => {
    const switcher = screen.getByTestId('colorscheme-toggle')

    expect(switcher).not.toBeChecked()
    fireEvent.click(switcher)
    expect(switcher).toBeChecked()

    //TODO: check if the colors have actually changed
  })
})
