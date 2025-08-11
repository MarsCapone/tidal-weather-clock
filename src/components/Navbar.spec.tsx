import Navbar from '@/components/Navbar'
import CONSTANTS from '@/constants'
import { render, screen } from '@testing-library/react'
import React from 'react'

describe('Navbar', () => {
  test('shows the title', () => {
    render(<Navbar setIsDarkMode={(v) => null} />)
    expect(screen.getByText(CONSTANTS.TITLE)).toBeInTheDocument()
  })
})
