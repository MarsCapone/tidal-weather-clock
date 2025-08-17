'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CogIcon } from 'lucide-react'
import { getTitle } from '@/hooks/useTitle'

export default function Breadcrumbs() {
  const paths = usePathname()
  const pathNames = paths.split('/').filter(Boolean).slice(1)

  const showBreadcrumbs = pathNames.at(-1) !== 'settings'
  if (!showBreadcrumbs) {
    return null
  }

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li className="link link-hover">
          <Link href="/">
            <CogIcon className="h-4 w-4" />
            Settings
          </Link>
        </li>
        {pathNames.map((path, i) => {
          const href = '/settings/' + pathNames.slice(0, i + 1).join('/')
          const title = getTitle(href, pathNames[i])

          if (href === paths) {
            return <li key={`path-${i}`}>{title}</li>
          }

          return (
            <li className={'link link-hover'} key={`path-${i}`}>
              <Link href={href}>{title}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
