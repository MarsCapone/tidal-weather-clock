import { format } from 'date-fns'

export default function DateDisplay({
  date,
  location,
}: {
  date: Date
  location?: string
}) {
  return (
    <>
      <h2 className="font-mono text-4xl sm:text-5xl">{format(date, 'PPPP')}</h2>
      {location && (
        <h3 className="font-mono text-xl sm:text-2xl">{location}</h3>
      )}
    </>
  )
}
