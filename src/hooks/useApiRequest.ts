import { Activity } from '@/types/activity'
import { IActivityFetcher } from '@/types/interfaces'
import { useEffect, useState } from 'react'

type Request = {
  method: 'get'
  url: string
}

const REQUESTS: Record<string, Request> = {
  getActivities: {
    method: 'get',
    url: '/api/activity',
  },
}

export default function useApiRequest<ReturnType>(
  requestType: keyof typeof REQUESTS,
  initial: ReturnType | null = null,
): ReturnType {
  const [val, setVal] = useState<ReturnType | null>(initial)
  useEffect(() => {
    const { method, url } = REQUESTS[requestType]
    if (method !== 'get') throw new Error('Method not implemented')
    fetch(url).then((res) =>
      res.json().then((body) => {
        setVal(body)
      }),
    )
  }, [requestType])

  return val as ReturnType
}

export function useActivities(activityFetcher: IActivityFetcher) {
  const [val, setVal] = useState<Activity[]>([])
  useEffect(() => {
    activityFetcher.getActivities(undefined).then((body) => {
      setVal(body)
    })
  }, [])

  return val
}
