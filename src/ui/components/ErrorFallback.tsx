import { isRouteErrorResponse, useRouteError } from 'react-router'
import { FallbackProps } from 'react-error-boundary'

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const content = () => {
    if (isRouteErrorResponse(error)) {
      return (
        <>
          <h1>
            Something went wrong!
            {error.status} {error.statusText}
          </h1>
          <p>{error.data}</p>
        </>
      )
    } else if (error instanceof Error) {
      return (
        <div>
          <h1 className="text-error text-2xl"></h1>
          <p>{error.message}</p>
          <p>The stack trace is:</p>
          <pre>{error.stack}</pre>
        </div>
      )
    } else {
      return <h1>Unknown Error</h1>
    }
  }

  return (
    <div>
      <div className="hero bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Something went wrong!</h1>
          </div>
        </div>
      </div>
      {content()}
    </div>
  )
}

export function ErrorElement() {
  const error = useRouteError()

  return (
    <div className="p-8">
      <ErrorFallback error={error} resetErrorBoundary={() => null} />
    </div>
  )
}
