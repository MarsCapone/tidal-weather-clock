import { Dispatch, useEffect } from 'react'

type TimeZoneSelectorProps = {
  timeZone: string
  setTimeZone: Dispatch<string>
}

export default function TimeZoneSelector({
  timeZone,
  setTimeZone,
}: TimeZoneSelectorProps) {
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
