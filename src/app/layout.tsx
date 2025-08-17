import CONSTANTS from '@/lib/constants'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import React from 'react'
import { auth0 } from '@/lib/auth0'

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await auth0.getSession()

  return (
    <html lang="en">
      <head>
        <title>{CONSTANTS.TITLE}</title>
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      </head>
      <body>
        <div id="root">
          <Providers session={session}>
            <Navbar />
            <div className="mx-auto flex min-w-full flex-col justify-center gap-10 p-10 text-center md:min-w-0">
              {children}
            </div>
          </Providers>
        </div>
      </body>
    </html>
  )
}
