import { Link, Outlet, useLoaderData, useMatches } from 'react-router'

export default function SettingsLayout(props: any) {
  const matches = useMatches()

  const showBreadcrumbs = !matches.some((m) => m.id === 'SettingsHome')
  const pageData = matches[matches.length - 1].data as
    | { title: string }
    | undefined
  const title = pageData ? pageData.title : ''

  return (
    <div className="p-10">
      <div className="mb-4">
        {showBreadcrumbs && (
          <div className="breadcrumbs text-sm mb-4">
            <ul>
              {matches.map((page, i) => {
                if (i === matches.length - 1) {
                  return (
                    <li key={i} className="font-bold">
                      {page.id}
                    </li>
                  )
                }
                return (
                  <li key={i}>
                    <Link to={page.pathname}>{page.id}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {title && <h1 className="text-3xl">{title}</h1>}
      </div>
      <Outlet />
    </div>
  )
}
