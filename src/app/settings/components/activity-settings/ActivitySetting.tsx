import { doRefresh } from '@/app/api/refresh'
import ActivitySettingsForm from '@/app/settings/components/activity-settings/ActivitySettingsForm'
import { getUserId } from '@/lib/auth0'
import {
  getActivitiesByUserId,
  putActivities,
  setActivities,
} from '@/lib/db/helpers/activity'
import { TActivity } from '@/lib/types/activity'
import { addDays, startOfToday } from 'date-fns'

export default async function ActivitySetting() {
  const userId = (await getUserId()) || 'global'
  const activities = await getActivitiesByUserId(userId, true)

  async function updateActivities(act: TActivity[]) {
    'use server'
    await setActivities(act, userId)
    await doRefresh({
      scope: 'user',
      userId: await getUserId(),
      startDate: startOfToday(),
      endDate: addDays(startOfToday(), 6),
    })
  }

  return (
    <ActivitySettingsForm
      userId={userId}
      activities={activities}
      setActivitiesAction={updateActivities}
    />
  )
}
