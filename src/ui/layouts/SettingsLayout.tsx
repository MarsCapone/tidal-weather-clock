import { Link, Outlet, useMatches } from 'react-router'

export default function SettingsLayout() {
  const matches = useMatches()

  const showBreadcrumbs = !matches.some((m) => m.id === 'SettingsHome')
  const pageData = matches.at(-1)?.data as { title: string } | undefined
  const title = pageData ? pageData.title : ''

  return (
    <div className="p-10">
      {undefined()}
      <div className="mb-4">
        {showBreadcrumbs && (
          <div className="breadcrumbs text-sm mb-4">
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
