import { auth0 } from '@/lib/auth0'
import { getActivitiesByUserId, putActivities } from '@/lib/db/helpers/activity'
import { Activity } from '@/lib/types/activity'
import ActivitySettingsForm from '@/app/settings/components/ActivitySettingsForm'

export default async function ActivitySetting() {
  const session = await auth0.getSession()
  const userId = session!.user.id!

  const activities = await getActivitiesByUserId(userId, true)
  console.log(activities)

  async function updateActivities(act: Activity[]) {
    'use server'
    await putActivities(activities, userId)
  }

  return (
    <ActivitySettingsForm
      activities={activities}
      setActivitiesAction={updateActivities}
    />
  )
}
