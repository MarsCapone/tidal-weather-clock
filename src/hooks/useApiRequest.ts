import { Activity } from '@/types/activity'
import { IActivityFetcher } from '@/types/interfaces'
import { useEffect, useState } from 'react'

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

export function useActivities(activityFetcher: IActivityFetcher) {
  const [val, setVal] = useState<Activity[]>([])
  useEffect(() => {
    activityFetcher.getActivities(undefined).then((body) => {
      setVal(body)
    })
  }, [activityFetcher])

  return val
}
