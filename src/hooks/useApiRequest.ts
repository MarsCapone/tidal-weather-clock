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
