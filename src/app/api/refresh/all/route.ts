import { doRefresh } from '@/app/api/refresh'
import CONSTANTS from '@/lib/constants'
import { getDataContextRange } from '@/lib/db/helpers/datacontext'

export async function GET(request: Request): Promise<Response> {
  // refresh everything ever

  const { earliest, latest } = await getDataContextRange(
    CONSTANTS.LOCATION_COORDS,
  )
  await doRefresh({
    scope: 'all',
    userId: null,
    startDate: earliest,
    endDate: latest,
    refreshDataContext: true,
  })

  return new Response('OK')
}
