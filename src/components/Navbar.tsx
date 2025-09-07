import ColorschemeToggle from '@/components/Colorscheme'
import ProfileMenu from '@/components/ProfileMenu'
import CONSTANTS from '@/lib/constants'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'

export default function Navbar() {
  const commonMenuLinks = [
    { label: 'About', href: '/about' },
    { label: 'Settings', href: '/settings' },
  ]

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
            <Link className="btn btn-ghost text-md md:text-xl" href="/">
              {CONSTANTS.TITLE}
            </Link>
          </div>
          <div className="navbar-center">
            <div className="hidden lg:flex">
              <ul className="menu menu-horizontal items-center gap-x-2 px-1">
                {commonMenuLinks.map(({ label, href }) => (
                  <li key={`navbar-menu-item-${label}`}>
                    <Link href={href} className="btn btn-ghost rounded-sm">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
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
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          {[{ label: 'Home', href: '/' }, ...commonMenuLinks].map(
            ({ label, href }) => (
              <li key={`sidebar-menu-item-${label}`}>
                <Link href={href} className={'menu-item text-2xl'}>
                  {label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  )
}
