import {
  ErrorResponse,
  isRouteErrorResponse,
  Link,
  useRouteError,
} from 'react-router'

const STATUS_CODE_MESSAGES: Record<number, string> = {
  // 1xx - Informational
  100: 'The tide’s just starting to roll in — hang tight, we’re still going.',
  101: 'We’re changing tides. Don’t worry, we’ll keep you afloat.',

  // 2xx - Success
  200: 'Smooth sailing! Everything’s shipshape.',
  201: 'A new wave has been born — your request made quite the splash.',

  // 3xx - Redirection
  301: 'This beach has shifted with the tide — you’ll find what you need over there.',
  302: 'We caught your message drifting — it’s now anchored at a new spot.',
  304: 'No new waves here — the tide hasn’t changed.',

  // 4xx - Client Errors
  400: 'That wave didn’t break right — something’s off with your request.',
  401: 'You need the captain’s permission to swim here.',
  403: 'These waters are off-limits — no wading allowed.',
  404: 'Lost at sea! We can’t find that shore.',
  408: 'Your request drifted out with the tide — try again.',
  418: 'Sorry, I only brew sea-foam lattes, not coffee.',

  // 5xx - Server Errors
  500: 'A rogue wave capsized the server — we’re bailing water.',
  502: 'The tidepool messenger got swept out to sea.',
  503: 'The tide’s out — our service will return with the waves.',
  504: 'Our message in a bottle never made it ashore.',
}

export default function ErrorElement() {
  const error = useRouteError()

  let content = null
  if (isRouteErrorResponse(error)) {
    content = <StatusCodeError error={error} />
  } else if (error instanceof Error) {
    content = <GenericError error={error} />
  } else {
    content = <FallbackError />
  }

  return (
    <div>
      <div className="hero bg-error/50 text-error-content">
        <div className="hero-content text-center min-h-screen">
          <div className="max-w-xl">
            <div>
              <h1 className="text-5xl font-bold">Something went wrong!</h1>
            </div>
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}

type StatusCodeErrorProps = {
  error: ErrorResponse
}

function StatusCodeError({ error }: StatusCodeErrorProps) {
  return (
    <div>
      <div className="text-4xl">{error.status}</div>
      {error.status in STATUS_CODE_MESSAGES && (
        <div className="text-3xl">{STATUS_CODE_MESSAGES[error.status]}</div>
      )}
      <div className="font-mono">{error.data}</div>
      <button className="btn btn-error text-error-content">
        <Link to={'/'}>Go to Home?</Link>
      </button>
    </div>
  )
}

type GenericErrorProps = {
  error: Error
}

function GenericError({ error }: GenericErrorProps) {
  return (
    <div>
      <h1 className="text-4xl">{error.message}</h1>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  )
}

function FallbackError() {
  return <div className="text-4xl">Unknown error</div>
}
