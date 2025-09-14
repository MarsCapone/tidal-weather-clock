import logger from '@/app/api/pinoLogger'
import { doRefresh } from '@/app/api/refresh'
import ActivitySettingsForm from '@/app/settings/components/activity-settings/ActivitySettingsForm'
import { auth0, getUserId } from '@/lib/auth0'
import { getActivitiesByUserId, setActivities } from '@/lib/db/helpers/activity'
import { TActivity } from '@/lib/types/activity'
import { addDays, startOfToday } from 'date-fns'

export default async function ActivitySetting() {
  const session = await auth0.getSession()
  const userId = await getUserId()
  const activities = await getActivitiesByUserId(userId)

  async function updateActivities(act: TActivity[]) {
    'use server'
    if (userId) {
      await setActivities(act, userId)
      await doRefresh({
        scope: 'user',
        userId: await getUserId(),
        startDate: startOfToday(),
        endDate: addDays(startOfToday(), 6),
      })
    } else {
      logger.warn('Cannot update activities without userId')
    }
  }

  if (!userId) {
    return (
      <div>
        You must be logged in to edit your activities. &lsquo;{userId}&rsquo;{' '}
        {JSON.stringify(session)}
      </div>
    )
  }

  return (
    <ActivitySettingsForm
      userId={userId}
      activities={activities}
      setActivitiesAction={updateActivities}
    />
  )
}
