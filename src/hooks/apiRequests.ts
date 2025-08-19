import { Dispatch, useEffect, useState } from 'react'

export const useDataContextInfo = readonlyApiHookFactory<{
  earliest: string
  latest: string
  all: string[]
} | null>({
  endpoint: '/api/dataContext',
})

type PersistUpdate<T = void> = (arg?: T) => void

type EndpointInfo<Params> = {
  method?: 'GET' | 'POST' | 'PUT'
  endpoint: string | ((params?: Params) => string)
}

type FetchEndpointInfo<ReturnType, Params> = EndpointInfo<Params> & {
  getBody?: (body: any) => ReturnType
  dependencies: (params?: Params) => any[]
}

type UpdateEndpointInfo<ReturnType, Params> = EndpointInfo<Params> & {
  makeBody?: (arg: ReturnType, params?: Params) => any
}

type ApiHookFactoryOptions<ReturnType, Params> = {
  fetchEndpointInfo: FetchEndpointInfo<ReturnType, Params>
  updateEndpointInfo: UpdateEndpointInfo<ReturnType, Params>
}

type ApiHook<T, P> = (
  initialValue: T,
  params?: P,
) => [T, PersistUpdate<T>, Dispatch<T>]

export function apiHookFactory<ReturnType, Params>({
  fetchEndpointInfo,
  updateEndpointInfo,
}: ApiHookFactoryOptions<ReturnType, Params>): ApiHook<ReturnType, Params> {
  function useApi(
    initialValue: ReturnType,
    params?: Params,
  ): [ReturnType, PersistUpdate<ReturnType>, Dispatch<ReturnType>] {
    // initially the value is as provided
    const [val, setVal] = useState<ReturnType>(initialValue)
    const [refresh, setRefresh] = useState(false)

    // generically fetch the data, and set it as the val
    useEffect(() => {
      const endpoint =
        typeof fetchEndpointInfo.endpoint === 'string'
          ? fetchEndpointInfo.endpoint
          : fetchEndpointInfo.endpoint(params)

      fetch(endpoint, {
        method: fetchEndpointInfo.method || 'GET',
      })
        .then((res) => res.json())
        .then((body) =>
          setVal(
            fetchEndpointInfo.getBody === undefined
              ? body
              : fetchEndpointInfo.getBody(body),
          ),
        )

      // we can't just put params here because params is an object, and we can't
      // compare objects with ===. But eslint doesn't like this because it can
      // detect that the real dependency is just `params`.
      // eslint-disable-next-line
    }, [refresh, ...fetchEndpointInfo.dependencies(params)])

    const persistVal = (arg: ReturnType): void => {
      const endpoint =
        typeof fetchEndpointInfo.endpoint === 'string'
          ? fetchEndpointInfo.endpoint
          : fetchEndpointInfo.endpoint(params)
      fetch(endpoint, {
        method: updateEndpointInfo.method || 'PUT',
        body: JSON.stringify(
          updateEndpointInfo.makeBody === undefined
            ? {}
            : updateEndpointInfo.makeBody(arg, params),
        ),
      }).then(() => setRefresh(!refresh))
    }

    const updateGivenOrInternal = (arg?: ReturnType) => {
      // if the arg is not given, update with the internal state
      // otherwise, update with the given value
      persistVal(arg === undefined ? val : arg)
    }

    // value, set the state internally, update the internal state OR update the given value
    return [val, updateGivenOrInternal, setVal]
  }

  return useApi
}

type ReadonlyApiHookFactoryOptions<ReturnType> = Omit<
  ApiHookFactoryOptions<ReturnType, never>['fetchEndpointInfo'],
  'dependencies'
>

export default function useApiRequest<ReturnType>(
  path: string,
  initial: ReturnType | null = null,
): ReturnType {
  const [val, setVal] = useState<ReturnType | null>(initial)
  useEffect(() => {
    fetch(path).then((res) =>
      res.json().then((body) => {
        setVal(body)
      }),
    )
  }, [path])

  return val as ReturnType
}

export function readonlyApiHookFactory<ReturnType>({
  method = 'GET',
  endpoint,
  getBody,
}: ReadonlyApiHookFactoryOptions<ReturnType>): (
  initialValue: ReturnType,
) => ReturnType {
  function useReadonlyApiRequest(initialValue: ReturnType): ReturnType {
    const [val, setVal] = useState<ReturnType>(initialValue)

    const path = typeof endpoint === 'string' ? endpoint : endpoint()

    useEffect(() => {
      fetch(path, {
        method: method || 'GET',
      })
        .then((res) => res.json())
        .then((body) => {
          setVal(getBody === undefined ? body : getBody(body))
        })
    }, [path])

    return val
  }

  return useReadonlyApiRequest
}
