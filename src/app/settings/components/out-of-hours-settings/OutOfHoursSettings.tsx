import OutOfHoursSettingForm from '@/app/settings/components/out-of-hours-settings/OutOfHoursSettingForm'
import { getUserId } from '@/lib/auth0'
import { getOrPutSetting, putSetting } from '@/lib/db/helpers/settings'
import { defaultWorkingHours, WorkingHoursSetting } from '@/lib/types/settings'

export default async function OutOfHoursSettings() {
  const userId = await getUserId()
  const workingHours = await getOrPutSetting<WorkingHoursSetting>(
    'working_hours',
    userId,
    defaultWorkingHours,
  )

  async function updateWorkingHours(wh: WorkingHoursSetting) {
    'use server'
    await putSetting<WorkingHoursSetting>('working_hours', wh, userId)
  }

  return (
    <OutOfHoursSettingForm
      workingHours={workingHours}
      setWorkingHoursAction={updateWorkingHours}
    />
  )
}
