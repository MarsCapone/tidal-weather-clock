import { ProfileMenuInternal } from '@/components/ProfileMenu'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, test, beforeEach, expect } from 'vitest'
import { exampleSession } from '@/lib/utils/test-data'

describe('ProfileMenu (empty)', () => {
  beforeEach(() => {
    render(<ProfileMenuInternal session={null} />)
  })

  test('should show signup and login buttons on click', () => {
    const button = screen.getByTestId('profile-menu-button')
    fireEvent.click(button)

    expect(screen.getByText('Sign Up')).toBeVisible()
    expect(screen.getByText('Log In')).toBeVisible()
  })
})

describe('ProfileMenu (with user)', () => {
  beforeEach(() => {
    render(<ProfileMenuInternal session={exampleSession} />)
  })

  test('should show profile image in button', () => {
    const button = screen.getByTestId('profile-menu-button')
    const avatar = screen.getByTestId('profile-menu-avatar')
    expect(button).toContain(avatar)
  })

  test('should greet the user', () => {
    fireEvent.click(screen.getByTestId('profile-menu-button'))

    expect(screen.getByText('Welcome')).toBeVisible()
    expect(screen.getByText(exampleSession.user.name!)).toBeVisible()
  })

  test('should show logout button', () => {
    fireEvent.click(screen.getByTestId('profile-menu-button'))

    expect(screen.getByText('Sign Out')).toBeVisible()
  })
})
