'use client'

import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import useTitle, { getTitle } from '@/hooks/useTitle'
import { CogIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const title = useTitle()
  const ff = useFeatureFlags()

  return (
    <div>
      <Breadcrumbs />
      <div className="p-10">
        {ff.showSettingsTitle && (
          <div className="mb-4">
            {title && <h1 className="text-3xl">{title}</h1>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function Breadcrumbs() {
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
