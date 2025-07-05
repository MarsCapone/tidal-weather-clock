import { Outlet } from 'react-router'
import ColorschemeToggle from '@/ui/components/Colorscheme'
import * as React from 'react'
import CONSTANTS from '@/ui/constants'

export default function Layout() {
  return (
    <div className="text-center mx-auto p-8 ">
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold">{CONSTANTS.title}</h1>
        <ColorschemeToggle />
      </div>
      <Outlet />
    </div>
  )
}
