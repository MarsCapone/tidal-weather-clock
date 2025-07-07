import { Link, Outlet } from 'react-router'
import ColorschemeToggle from '@/ui/components/Colorscheme'
import CONSTANTS from '@/ui/constants'
import { HomeIcon } from '@heroicons/react/24/solid'

export default function Layout() {
  return (
    <div className="text-center mx-auto p-8 bg-background text-content">
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold">{CONSTANTS.title}</h1>
        <div className="flex gap-2">
          <Link to={'/'}>
            <HomeIcon className="h-6 w-6 m-3" />
          </Link>
          <ColorschemeToggle />
        </div>
      </div>
      <Outlet />
    </div>
  )
}
