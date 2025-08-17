'use server'
import ActivitySettings from '@/app/settings/components/ActivitySetting'
import OutOfHoursSettings from '@/app/settings/components/OutOfHoursSettings'
import TimeZoneSettings from '@/app/settings/components/TimeZoneSettings'
import SettingsMenu from '@/app/settings/components/SettingsMenu'
import { auth0 } from '@/lib/auth0'
import React from 'react'

type SettingLink = {
  Component: () => React.ReactNode
  id: string
  label: string
}

async function Page() {
  const links: SettingLink[] = [
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
        <SettingsMenu links={links.map(({ id, label }) => ({ id, label }))} />
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

export default auth0.withPageAuthRequired(Page, {
  returnTo: '/settings',
})
