import { getSetting, putSetting } from '@/db/helpers/settings'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams || {}

  const settingName = searchParams.get('name')
  if (!settingName) {
    return Response.json({ error: 'Missing setting "name"' }, { status: 400 })
  }

  const setting = await getSetting<unknown>(settingName)
  if (setting === undefined || setting === null) {
    return Response.json({ value: null })
  }
  return Response.json({ value: setting })
}

export async function PUT(request: NextRequest) {
  const { name, value }: Partial<{ name: string; value: any }> =
    await request.json()
  if (!name) {
    return Response.json(
      { error: 'Missing name "name" in body' },
      { status: 400 },
    )
  }
  if (!value) {
    return Response.json(
      { error: 'Missing value "value" in body' },
      { status: 400 },
    )
  }

  await putSetting<typeof value>(name, value)
  return Response.json({}, { status: 201 })
}
