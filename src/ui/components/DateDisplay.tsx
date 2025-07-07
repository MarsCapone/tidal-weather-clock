import { addDays } from 'date-fns'

export default function DateDisplay({ date }: { date?: Date }) {
  if (!date) {
    date = addDays(new Date(), 1)
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }

  return (
    <h2 className="font-mono text-4xl sm:text-5xl">
      {date.toLocaleDateString('en-GB', options)}
    </h2>
  )
}
