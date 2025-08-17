'use client'
import { SettingCard, SettingTitle } from '@/app/settings/components/common'
import { TimeZoneContext } from '@/lib/utils/contexts'
import { useContext, useEffect } from 'react'

export default function TimeZoneSettings() {
  return (
    <div>
      <SettingTitle title={'Timezone'} />
      <SettingCard>
        <TimeZoneSelector />
      </SettingCard>
    </div>
  )
}

function TimeZoneSelector() {
  const { timeZone, setTimeZone } = useContext(TimeZoneContext)

  useEffect(() => {
    const current = localStorage.getItem('tz')
    if (current) {
      setTimeZone(current)
    }
  }, [setTimeZone])

  const update = (val: string) => {
    localStorage.setItem('tz', val)
    setTimeZone(val)
  }

  return (
    <div>
      <select
        value={timeZone}
        className="select w-full"
        onChange={(e) => update(e.target.value)}
      >
        <option>Etc/UTC</option>
        <option>Europe/London</option>
        <option>Europe/Paris</option>
      </select>
    </div>
  )
}
