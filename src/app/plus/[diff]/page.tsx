import MainContent from '@/components/MainContent'
import CONSTANTS from '@/constants'
import { addDays, startOfToday } from 'date-fns'

export default async function Page({
  params,
}: {
  params: Promise<{ diff: string }>
}) {
  const { diff } = await params

  const today = startOfToday()
  const diffDays = Number.parseInt(diff)

  const prevPath =
    diffDays <= 0 ? null : diffDays === 1 ? '/' : `/plus/${diffDays - 1}`

  const nextPath =
    diffDays >= CONSTANTS.MAX_PERMITTED_DAYS
      ? `/plus/${CONSTANTS.MAX_PERMITTED_DAYS}`
      : `/plus/${diffDays + 1}`

  const date = addDays(
    today,
    diffDays <= 0
      ? 0
      : diffDays >= CONSTANTS.MAX_PERMITTED_DAYS
        ? CONSTANTS.MAX_PERMITTED_DAYS
        : diffDays,
  )

  return <MainContent date={date} nextPath={nextPath} prevPath={prevPath} />
}
