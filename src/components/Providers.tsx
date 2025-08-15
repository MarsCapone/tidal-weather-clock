'use client'

import CONSTANTS from '@/constants'
import { DarkModeContext, TimeZoneContext } from '@/utils/contexts'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import React from 'react'

export default function Providers({ children }: React.PropsWithChildren) {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false)
  const [timeZone, setTimeZone] = React.useState('Europe/London')

  return (
    <React.StrictMode>
      <LDProvider clientSideID={CONSTANTS.LD_CLIENT_ID}>
        <DarkModeContext value={{ isDarkMode, setIsDarkMode }}>
          <TimeZoneContext value={timeZone}>{children}</TimeZoneContext>
        </DarkModeContext>
      </LDProvider>
    </React.StrictMode>
  )
}
