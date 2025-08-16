import logger from '@/app/api/pinoLogger'
import { db } from '@/lib/db'
import { getActivitiesByUserId, putActivities } from '@/lib/db/helpers/activity'
import { activityTable, constraintTable } from '@/lib/db/schemas/activity'
import { Activity, Constraint } from '@/lib/types/activity'
import { eq, notInArray, sql } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams || {}

  const userId = searchParams.get('user_id') || 'demouser'

  const activityResponses = await getActivitiesByUserId(userId)

  logger.info('fetched activities from db', {
    activityCount: activityResponses.length,
    userId,
  })

  return Response.json(
    activityResponses.map((activityResponse) => ({
      ...activityResponse,
      // sometimes null gets set as the value
      constraints: activityResponse.constraints.filter((v) => v !== null),
    })),
  )
}

export async function PUT(request: NextRequest): Promise<Response> {
  const data: { userId?: string; activities: Activity[] } = await request.json()
  if (!data.activities) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const userId = data.userId || 'demouser'
  const activities = data.activities

  // upsert all the activities
  await putActivities(activities, userId)

  logger.debug('added all constraints')

  return new Response('', { status: 201 })
}
