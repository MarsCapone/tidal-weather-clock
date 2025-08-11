import Navbar from '@/components/Navbar'
import CONSTANTS from '@/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import { text } from 'drizzle-orm/pg-core'
import React from 'react'

describe('Navbar', () => {
  beforeEach(() => {
    render(<Navbar setIsDarkMode={(v) => null} />)
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
    const switcher = screen.getByRole('checkbox')

    expect(switcher).not.toBeChecked()
    fireEvent.click(switcher)
    expect(switcher).toBeChecked()

    //TODO: check if the colors have actually changed
  })
})
