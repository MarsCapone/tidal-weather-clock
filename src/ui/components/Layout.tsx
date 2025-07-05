import Title from '@/ui/components/Title'
import { Outlet } from 'react-router'
import ColorschemeToggle from '@/ui/components/Colorscheme'
import * as React from 'react'

export default function Layout() {
  return (
    <div className="text-center mx-auto p-8 ">
      <div className="flex justify-between">
        <Title />
        <ColorschemeToggle />
      </div>
      <Outlet />
    </div>
  )
}
