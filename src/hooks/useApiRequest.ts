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

export function useSetting<T>(
  settingName: string,
  initialValue: T,
): [T, PersistUpdate<T>, Dispatch<T>] {
  const [val, setVal] = useState<T>(initialValue)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    fetch(`/api/settings?name=${settingName}`)
      .then((res) => res.json())
      .then((body: { value: T }) => {
        setVal(body.value)
      })
  }, [settingName, refresh])

  const updateSetting = (settingValue: T) => {
    fetch(`/api/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        name: settingName,
        value: settingValue,
      }),
    }).then(() => setRefresh(!refresh))
  }

  function updateGivenOrInternal(v?: T | void): void {
    if (v === undefined) {
      // update with the internal state
      updateSetting(val)
    } else {
      // update with the given value
      updateSetting(v)
    }
  }

  // value, set the state internally, update the internal state OR update the given value
  return [val, updateGivenOrInternal as PersistUpdate<T>, setVal]
}
