'use client'

import ActivitySettings from '@/app/settings/components/ActivitySettings'
import OutOfHoursSettings from '@/app/settings/components/OutOfHoursSettings'
import TimeZoneSettings from '@/app/settings/components/TimeZoneSettings'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import Link from 'next/link'
import { useState } from 'react'

function Page() {
  const [hash, setHash] = useState('')

  const links = [
    {
      Component: TimeZoneSettings,
      id: 'timezone',
      label: 'Timezone',
    },
    {
      Component: OutOfHoursSettings,
      id: 'working-hours',
      label: 'Working Hours',
    },
    { Component: ActivitySettings, id: 'activities', label: 'Activities' },
  ]

  return (
    <div className="flex flex-row justify-center gap-8 text-start">
      <div className="hidden w-1/6 lg:block">
        <div className="sticky top-10 flex w-full flex-col gap-4">
          <ul className="menu bg-base-200 rounded-box w-full">
            <li className="menu-title">Settings</li>
            {links.map((link) => {
              const linkHash = `#${link.id}`

              return (
                <li
                  className={
                    link.Component === undefined ? 'menu-disabled' : ''
                  }
                  key={`link-${link.id}`}
                >
                  <Link
                    className={hash === linkHash ? 'menu-active' : ''}
                    href={linkHash}
                    onClick={() => setHash(linkHash)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        {links.map(({ Component, id }) => {
          if (Component) {
            return (
              <div className="mb-12" id={id} key={`content-${id}`}>
                <Component />
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

export default withPageAuthRequired(Page)
