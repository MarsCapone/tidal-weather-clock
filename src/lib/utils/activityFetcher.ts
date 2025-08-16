import { Activity } from '@/lib/types/activity'
import { IActivityFetcher } from '@/lib/types/interfaces'
import logger from '@/lib/utils/logger'

export class ServerActivityFetcher implements IActivityFetcher {
  async getActivities(userId: string | undefined): Promise<Activity[]> {
    const response = await fetch(
      userId !== undefined
        ? `/api/activity?user_id=${userId}`
        : '/api/activity',
    )

    const content = await response.json()
    if (response.ok && content) {
      return content as Activity[]
    }

    throw new Error('Error getting activities')
  }

  async setActivities(
    userId: string | undefined,
    activities: Activity[],
  ): Promise<void> {
    const response = await fetch('/api/activity', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, activities }),
    })

    if (!response.ok) {
      logger.error('Failed to set activities', { response })
      throw new Error('Error setting activities')
    }
  }
}
