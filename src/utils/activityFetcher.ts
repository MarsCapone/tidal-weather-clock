import { EXAMPLE_DATA } from '@/constants'
import { Activity } from '@/types/activity'
import { IActivityFetcher } from '@/types/interfaces'

export class DemoActivityFetcher implements IActivityFetcher {
  async getActivities(userId: string): Promise<Activity[]> {
    return EXAMPLE_DATA.Activities
  }
}

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
}
