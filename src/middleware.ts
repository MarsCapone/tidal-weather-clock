import { DEFAULT_FEATURE_FLAGS } from '@/constants'
import { get } from '@vercel/edge-config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Fetch feature flags from Edge Config and then set them as a cookie
  const flags = await get<Partial<typeof DEFAULT_FEATURE_FLAGS>>('featureFlags')
  const expandedFlags = {
    ...DEFAULT_FEATURE_FLAGS,
    ...(flags || {}),
  }
  const response = NextResponse.next()

  response.cookies.set('featureFlags', JSON.stringify(expandedFlags))

  return response
}
