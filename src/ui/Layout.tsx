import { Link, Outlet } from 'react-router'
import ColorschemeToggle from '@/ui/components/Colorscheme'
import CONSTANTS from '@/ui/constants'
import { HomeIcon } from '@heroicons/react/24/solid'

export default function Layout() {
  return (
    <div>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            {CONSTANTS.TITLE}
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link
                to={'/'}
                className="btn btn-ghost btn-disabled cursor-not-allowed"
              >
                Settings
              </Link>
            </li>
            <li>
              <ColorschemeToggle />
            </li>
          </ul>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
