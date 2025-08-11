'use client'

import CONSTANTS from '@/constants'
import './globals.css'
import Navbar from '@/components/Navbar'
import { DarkModeContext, TimeZoneContext } from '@/utils/contexts'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false)
  const [timeZone, setTimeZone] = React.useState('Europe/London')

  return (
    <Root>
      <DarkModeContext value={isDarkMode}>
        <div>
          <Navbar setIsDarkMode={setIsDarkMode} />
          <div className="mx-auto flex min-w-full flex-col justify-center gap-10 p-10 text-center md:min-w-0">
            <TimeZoneContext value={timeZone}>{children}</TimeZoneContext>
          </div>
        </div>
      </DarkModeContext>
    </Root>
  )
}

function Root({ children }: { children: React.ReactNode }) {
  // return <div>{children}</div>
  return (
    <html lang="en">
      <head>
        <title>{CONSTANTS.TITLE}</title>
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      </head>
      <body>
        <div id="root">
          <React.StrictMode>
            <LDProvider clientSideID={CONSTANTS.LD_CLIENT_ID}>
              {children}
            </LDProvider>
          </React.StrictMode>
        </div>
      </body>
    </html>
  )
}
