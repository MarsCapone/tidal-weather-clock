import db from '@/app/api/dataContext/[dateString]/db'
import CONSTANTS from '@/lib/constants'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<Response> {
  // get metadata about the data context API

  const range = await db.getDataContextRange(CONSTANTS.LOCATION_COORDS)

  return Response.json(range)
}
