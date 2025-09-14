'use client'

import { utcDateStringToUtc } from '@/lib/utils/dates'
import logger from '@/lib/utils/logger'
import { addDays, isWithinInterval } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import Link from 'next/link'
import React from 'react'

export type NavBarLinksProps = {
  includeHome?: boolean
  ulClassName?: string
  linkClassName?: string
}

export default function NavBarLinks({
  includeHome = false,
  ulClassName,
  linkClassName,
}: NavBarLinksProps) {
  const { showBirthdayBanner } = useFlags()

  logger.debug('showBirthdayBanner', { showBirthdayBanner })
  let isBirthday = false
  if (showBirthdayBanner === undefined) {
    logger.debug('showBirthdayBanner is undefined')
  } else if (showBirthdayBanner === 'always') {
    isBirthday = true
  } else if (showBirthdayBanner.startsWith('range')) {
    const [start, end] = showBirthdayBanner.split(':').slice(1)
    logger.debug('showBirthdayBanner is range', { start, end })
    isBirthday = isWithinInterval(new Date(), {
      start: utcDateStringToUtc(start),
      end: addDays(utcDateStringToUtc(end), start === end ? 1 : 0),
    })
  }

  const commonMenuLinks = [
    includeHome && { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    isBirthday && {
      label: 'Happy Birthday Mum!',
      className: 'font-extrabold text-3xl',
      href: '/birthday',
    },
    { label: 'Settings', href: '/settings' },
  ].filter((v) => v !== false)

  return (
    <ul className={ulClassName}>
      {commonMenuLinks.map(({ label, href, className }) => (
        <li key={`navbar-menu-item-${label}`}>
          <Link
            href={href}
            className={`${linkClassName} ${className ? className : ''}`}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
