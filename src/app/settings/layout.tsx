'use client'

import Link from 'next/link'
import { useMatches } from 'react-router'

export default function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches()

  const showBreadcrumbs = !matches.some((m) => m.id === 'SettingsHome')
  const pageData = matches.at(-1)?.data as { title: string } | undefined
  const title = pageData ? pageData.title : ''

  return (
    <div className="p-10">
      <div className="mb-4">
        {showBreadcrumbs && (
          <div className="breadcrumbs mb-4 text-sm">
            <ul>
              {matches.map((page, i) => {
                if (i === matches.length - 1) {
                  return (
                    <li className="font-bold" key={i}>
                      {page.id}
                    </li>
                  )
                }
                return (
                  <li key={i}>
                    <Link href={page.pathname}>{page.id}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {title && <h1 className="text-3xl">{title}</h1>}
      </div>
      {children}
    </div>
  )
}
