import { render, screen } from '@testing-library/react'
import React from 'react'
import Page from './page'

test('renders the page', () => {
  render(<Page />)
  expect(screen.getByText(/Suggested Activity/)).toBeInTheDocument()
})
