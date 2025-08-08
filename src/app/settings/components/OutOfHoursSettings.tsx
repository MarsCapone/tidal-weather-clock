import { SettingTitle } from '@/app/settings/components/common'
import { db } from '@/db'
import { settingsTable } from '@/db/schemas/settings'
import { useSetting } from '@/hooks/useApiRequest'
import { eq } from 'drizzle-orm'
import { Suspense, useEffect, useState } from 'react'

type WorkingHoursSetting = {
  startHour: number
  endHour: number
  enabled: boolean
}

const defaultSetting: WorkingHoursSetting = {
  startHour: 8,
  endHour: 19,
  enabled: false,
}

export default function OutOfHoursSettings() {
  const [workingHours, updateWorkingHours, setWorkingHours] =
    useSetting<WorkingHoursSetting>('working_hours')

  useEffect(() => {
    setWorkingHours(defaultSetting)
  }, [setWorkingHours])

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <SettingTitle title={'Out of Hours'} />
        <button onClick={() => updateWorkingHours()} className="btn">
          Update setting
        </button>
      </div>
      <div>Do not suggest activities outside of these hours.</div>
      <div>{JSON.stringify(workingHours, null, 2)}</div>
    </div>
  )
}
