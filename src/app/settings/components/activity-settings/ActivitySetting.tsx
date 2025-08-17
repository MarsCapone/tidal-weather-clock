import { auth0 } from '@/lib/auth0'
import { getActivitiesByUserId, putActivities } from '@/lib/db/helpers/activity'
import { Activity } from '@/lib/types/activity'
import ActivitySettingsForm from '@/app/settings/components/activity-settings/ActivitySettingsForm'

export default async function ActivitySetting() {
  const session = await auth0.getSession()
  const userId = session!.user.email!

  const activities = await getActivitiesByUserId(userId, true)

  async function updateActivities(act: Activity[]) {
    'use server'
    await putActivities(act, userId)
  }

  return (
    <ActivitySettingsForm
      userId={userId}
      activities={activities}
      setActivitiesAction={updateActivities}
    />
  )
}
