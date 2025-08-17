'use client'

import CONSTANTS from '@/lib/constants'
import {
  DarkModeContext,
  TimeZoneContext,
  SessionContext,
} from '@/lib/utils/contexts'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import React from 'react'
import { SessionData } from '@auth0/nextjs-auth0/types'

export default function Providers({
  session,
  children,
}: React.PropsWithChildren & {
  session: SessionData | null
}) {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false)
  const [timeZone, setTimeZone] = React.useState('Europe/London')

  return (
    <React.StrictMode>
      <LDProvider clientSideID={CONSTANTS.LD_CLIENT_ID}>
        <DarkModeContext value={{ isDarkMode, setIsDarkMode }}>
          <TimeZoneContext value={{ timeZone, setTimeZone }}>
            <SessionContext value={session}>{children}</SessionContext>
          </TimeZoneContext>
        </DarkModeContext>
      </LDProvider>
    </React.StrictMode>
  )
}
