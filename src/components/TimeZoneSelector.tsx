'use client'

import { TimeZoneContext } from '@/utils/contexts'
import { useContext, useEffect } from 'react'

export default function TimeZoneSelector() {
  const { timeZone, setTimeZone } = useContext(TimeZoneContext)

  useEffect(() => {
    localStorage.setItem('tz', timeZone)
  }, [timeZone])

  return (
    <div>
      <select
        value={timeZone}
        className="select select-ghost"
        onChange={(e) => setTimeZone(e.target.value)}
      >
        <option>Etc/UTC</option>
        <option>Europe/London</option>
        <option>Europe/Paris</option>
      </select>
    </div>
  )
}
