import DateProvider from '@/components/date-management/DateProvider'
import { dateOptions } from '@/lib/utils/dates'
import { startOfToday } from 'date-fns'
import { getActivitiesByUserId } from '@/lib/db/helpers/activity'
import { auth0 } from '@/lib/auth0'
import MainContentWithoutDate from '@/components/MainContent'

export default function App() {
  return (
    <DateProvider initialDate={startOfToday(dateOptions)}>
      <AppContent />
    </DateProvider>
  )
}

async function AppContent() {
  const session = await auth0.getSession()
  const activities = await getActivitiesByUserId(
    session === null ? 'global' : session!.user!.email!,
    true,
  )

  return <MainContentWithoutDate activities={activities} />
}
