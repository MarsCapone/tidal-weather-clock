import { SettingTitle } from '@/app/settings/components/common'
import { db } from '@/db'
import { settingsTable } from '@/db/schemas/settings'
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
  const [setting, setSetting] = useState<WorkingHoursSetting | null>(null)

  useEffect(() => {
    fetch(`/api/settings?name=working_hours`)
      .then((res) => res.json())
      .then((data) => {
        setSetting(data.value || defaultSetting)
      })
  }, [])

  const updateSetting = async () => {
    await fetch(`/api/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 'working_hours',
        value: setting,
      }),
    })
  }

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <SettingTitle title={'Out of Hours'} />
        <button onClick={updateSetting} className="btn">
          Update setting
        </button>
      </div>
      <div>Do not suggest activities outside of these hours.</div>
      <div>{JSON.stringify(setting, null, 2)}</div>
    </div>
  )
}
