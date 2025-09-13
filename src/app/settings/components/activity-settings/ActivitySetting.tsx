import ActivitySettingsForm from '@/app/settings/components/activity-settings/ActivitySettingsForm'
import { getUserId } from '@/lib/auth0'
import {
  getActivitiesByUserId,
  putActivities,
  setActivities,
} from '@/lib/db/helpers/activity'
import { TActivity } from '@/lib/types/activity'

export default async function ActivitySetting() {
  const userId = (await getUserId()) || 'global'
  const activities = await getActivitiesByUserId(userId, true)

  async function updateActivities(act: TActivity[]) {
    'use server'
    await setActivities(act, userId)
  }

  return (
    <ActivitySettingsForm
      userId={userId}
      activities={activities}
      setActivitiesAction={updateActivities}
    />
  )
}
