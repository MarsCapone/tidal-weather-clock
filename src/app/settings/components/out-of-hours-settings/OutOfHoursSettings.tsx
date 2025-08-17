import { getSetting, putSetting } from '@/lib/db/helpers/settings'
import { auth0 } from '@/lib/auth0'
import OutOfHoursSettingForm from '@/app/settings/components/out-of-hours-settings/OutOfHoursSettingForm'
import { defaultWorkingHours, WorkingHoursSetting } from '@/lib/types/settings'

export default async function OutOfHoursSettings() {
  const session = await auth0.getSession()
  const workingHours = await getSetting<WorkingHoursSetting>(
    'working_hours',
    session!.user.email!,
  )

  async function updateWorkingHours(wh: WorkingHoursSetting) {
    'use server'
    await putSetting<WorkingHoursSetting>(
      'working_hours',
      wh,
      session!.user.email!,
    )
  }

  return (
    <OutOfHoursSettingForm
      workingHours={workingHours || defaultWorkingHours}
      setWorkingHoursAction={updateWorkingHours}
    />
  )
}
