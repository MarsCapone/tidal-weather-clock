'use client'

import MainContent from '@/components/MainContent'
import useDateString from '@/hooks/useDateString'
import { differenceInMilliseconds, startOfToday } from 'date-fns'
import React from 'react'
import logger from '../utils/logger'

const today = startOfToday()

export default function Page() {
  const { date, nextPath, prevPath } = useDateString(undefined)
  logger.info('Page render', {
    date,
    diff: differenceInMilliseconds(today, date),
    differs: today !== date,
    nextPath,
    prevPath,
  })
  return <MainContent date={date} nextPath={nextPath} prevPath={prevPath} />
}
