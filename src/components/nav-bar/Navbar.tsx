import ColorschemeToggle from '@/components/Colorscheme'
import ProfileMenu from '@/components/profile/ProfileMenu'
import CONSTANTS from '@/lib/constants'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'
import NavBarLinks from './NavBarLinks'

export default function Navbar() {
  return (
    <div className="drawer">
      <input type="checkbox" id="menu-drawer" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/*  Navbar */}
        <div className="navbar bg-base-100 w-full shadow-sm">
          <div className="navbar-start">
            <label
              htmlFor="menu-drawer"
              aria-label={'open sidebar'}
              className="btn btn-square btn-ghost lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </label>
            <Link className="btn btn-ghost text-xl md:text-2xl" href="/">
              {CONSTANTS.TITLE}
            </Link>
          </div>
          <div className="navbar-center">
            <div className="hidden lg:flex">
              <NavBarLinks
                ulClassName="menu menu-horizontal items-center gap-x-2 px-1"
                linkClassName="btn btn-ghost rounded-sm"
              />
            </div>
          </div>
          <div className="navbar-end">
            <ul className="menu menu-horizontal items-center">
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
      </div>

      <div className="drawer-side">
        {/*  Sidebar */}
        <label
          htmlFor="menu-drawer"
          aria-label={'close sidebar'}
          className={'drawer-overlay'}
        ></label>
        <NavBarLinks
          ulClassName="menu bg-base-200 min-h-full w-80 p-4"
          linkClassName="menu-item text-2xl"
          includeHome
        />
      </div>
    </div>
  )
}
