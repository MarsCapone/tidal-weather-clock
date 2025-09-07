import ActivitySettingsForm from '@/app/settings/components/activity-settings/ActivitySettingsForm'
import { getUserId } from '@/lib/auth0'
import { getActivitiesByUserId, putActivities } from '@/lib/db/helpers/activity'
import { TActivity } from '@/lib/types/TActivity'

export default async function ActivitySetting() {
  const userId = (await getUserId()) || 'global'
  const activities = await getActivitiesByUserId(userId, true)

  async function updateActivities(act: TActivity[]) {
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
