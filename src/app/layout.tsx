'use client'

import ColorschemeToggle from '@/components/Colorscheme'
import CONSTANTS from '@/constants'
import Link from 'next/link'
import './globals.css'
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
          <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1">
              <Link className="btn btn-ghost text-md md:text-xl" href="/">
                {CONSTANTS.TITLE}
              </Link>
            </div>
            <div className="flex-none">
              <ul className="menu menu-horizontal items-center gap-x-2 px-1">
                <li>
                  <Link className="btn btn-ghost rounded-sm" href="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="btn btn-ghost rounded-sm" href={'/settings'}>
                    Settings
                  </Link>
                </li>
                {/*<li>*/}
                {/*  <TimeZoneSelector timeZone={timeZone} setTimeZone={setTimeZone} />*/}
                {/*</li>*/}
                <li>
                  <ColorschemeToggle setIsDarkMode={setIsDarkMode} />
                </li>
              </ul>
            </div>
          </div>
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
