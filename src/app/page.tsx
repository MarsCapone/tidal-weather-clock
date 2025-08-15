import MainContent from '@/components/MainContent'
import { dateOptions } from '@/utils/dates'
import { startOfToday } from 'date-fns'
import React from 'react'

export default async function Page() {
  const today = startOfToday(dateOptions)
  return <MainContent date={today} nextPath={'/plus/1'} prevPath={null} />
}
