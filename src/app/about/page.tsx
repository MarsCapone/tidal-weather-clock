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
            sun, wind, and weather information is pulled from OpenMeteo and the
            Admiralty tide data.
          </p>
          <p>
            Each day all constraints are evaluated against the latest data, and
            the &quot;best&quot; suggestion is given.
          </p>
          <p className="text-xs">
            Created by{' '}
            <a className="link" href="https://github.com/MarsCapone">
              Samson Ventura-Danziger
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
