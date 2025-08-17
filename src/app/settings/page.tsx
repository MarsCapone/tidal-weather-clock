import ActivitySettings from '@/app/settings/components/activity-settings/ActivitySetting'
import OutOfHoursSettings from '@/app/settings/components/out-of-hours-settings/OutOfHoursSettings'
import TimeZoneSettings from '@/app/settings/components/TimeZoneSettings'
import SettingsMenu from '@/app/settings/components/common/SettingsMenu'
import React from 'react'
import { auth0 } from '@/lib/auth0'
import { AppRouterPageRoute } from '@auth0/nextjs-auth0/server'

type SettingLink = {
  Component: () => React.ReactNode
  id: string
  label: string
}

function PageContent() {
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

// @ts-ignore
export default auth0.withPageAuthRequired(PageContent, {
  returnTo: '/settings',
}) as AppRouterPageRoute
