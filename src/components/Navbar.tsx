import ColorschemeToggle from '@/components/Colorscheme'
import ProfileMenu from '@/components/ProfileMenu'
import CONSTANTS from '@/constants'
import Link from 'next/link'
import React, { Suspense } from 'react'

export default function Navbar() {
  return (
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
          <li>
            <ColorschemeToggle />
          </li>
          <li>
            <Suspense fallback={null}>
              <ProfileMenu />
            </Suspense>
          </li>
        </ul>
      </div>
    </div>
  )
}
