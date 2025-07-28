'use client'

export default function Page() {
  return (
    <div className="">
      <div className="card card-lg text-start shadow-sm">
        <div className="card-body">
          <div className="card-title">About</div>
          <p>
            Tidal Weather Clock is a tool to help decide which activity to do.
          </p>
          <p>It currently only supports a single location.</p>
          <p>
            Activities can be configured with various constraints. Then tide,
            sun, wind, and weather information is pulled from the{' '}
            <a href="https://stormglass.io/" className="link">
              Stormglass API
            </a>
            .
          </p>
          <p>
            Each day all constraints are evaluated against the latest data, and
            the "best" suggestion is given.
          </p>
          <p className="text-xs">
            Created by{' '}
            <a href="https://github.com/MarsCapone" className="link">
              Samson Ventura-Danziger
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
