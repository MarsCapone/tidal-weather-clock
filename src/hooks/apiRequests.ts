import { Activity } from '@/types/activity'
import { IActivityFetcher } from '@/types/interfaces'
import logger from '@/utils/logger'
import { Dispatch, useEffect, useState } from 'react'

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

export function useActivities(
  activityFetcher: IActivityFetcher,
): [Activity[], Dispatch<Activity[]>] {
  const [val, setVal] = useState<Activity[]>([])
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    activityFetcher.getActivities(undefined).then((body) => {
      setVal(body)
    })
  }, [activityFetcher, refresh])

  const updateActivities = (activities: Activity[]) => {
    activityFetcher.setActivities(undefined, activities).then(() => {
      logger.debug('updated activities from client')
      setRefresh(!refresh)
    })
  }

  return [val, updateActivities]
}

type PersistUpdate<T = void> = (arg?: T) => void

type EndpointInfo<Params> = {
  method: 'GET' | 'POST' | 'PUT'
  endpoint: (params: Params) => string
}

type FetchEndpointInfo<ReturnType, Params> = EndpointInfo<Params> & {
  getBody: (body: any) => ReturnType
  dependencies: (params: Params) => any[]
}

type UpdateEndpointInfo<ReturnType, Params> = EndpointInfo<Params> & {
  makeBody: (arg: ReturnType, params: Params) => any
}

type UseAPIFactoryOptions<ReturnType, Params> = {
  fetchEndpointInfo: FetchEndpointInfo<ReturnType, Params>
  updateEndpointInfo: UpdateEndpointInfo<ReturnType, Params>
}

type ApiHook<T, P> = (
  initialValue: T,
  params: P,
) => [T, PersistUpdate<T>, Dispatch<T>]

export function apiHookFactory<ReturnType, Params>({
  fetchEndpointInfo,
  updateEndpointInfo,
}: UseAPIFactoryOptions<ReturnType, Params>): ApiHook<ReturnType, Params> {
  function useApi(
    initialValue: ReturnType,
    params: Params,
  ): [ReturnType, PersistUpdate<ReturnType>, Dispatch<ReturnType>] {
    // initially the value is as provided
    const [val, setVal] = useState<ReturnType>(initialValue)
    const [refresh, setRefresh] = useState(false)

    // generically fetch the data, and set it as the val
    useEffect(() => {
      fetch(fetchEndpointInfo.endpoint(params), {
        method: fetchEndpointInfo.method,
      })
        .then((res) => res.json())
        .then((body) => setVal(fetchEndpointInfo.getBody(body)))

      // we can't just put params here because params is an object, and we can't
      // compare objects with ===. But eslint doesn't like this because it can
      // detect that the real dependency is just `params`.
      // eslint-disable-next-line
    }, [refresh, ...fetchEndpointInfo.dependencies(params)])

    const persistVal = (arg: ReturnType): void => {
      fetch(updateEndpointInfo.endpoint(params), {
        method: updateEndpointInfo.method,
        body: JSON.stringify(updateEndpointInfo.makeBody(arg, params)),
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
