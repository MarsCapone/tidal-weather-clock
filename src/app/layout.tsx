'use client'

import ColorschemeToggle from '@/components/Colorscheme'
import CONSTANTS from '@/constants'
import Link from 'next/link'
import './globals.css'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <div>
        <div className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <Link className="btn btn-ghost text-md md:text-xl" href="/public">
              {CONSTANTS.TITLE}
            </Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal items-center px-1">
              <li>
                <Link className="btn btn-ghost rounded-sm" href={'/settings'}>
                  Settings
                </Link>
              </li>
              <li>
                <ColorschemeToggle />
              </li>
            </ul>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </Root>
  )
}

export function Root({ children }: { children: React.ReactNode }) {
  // return <div>{children}</div>
  return (
    <html lang="en">
      <head>
        <title>{CONSTANTS.TITLE}</title>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="root">
          <React.StrictMode>{children}</React.StrictMode>
        </div>
      </body>
    </html>
  )
}
