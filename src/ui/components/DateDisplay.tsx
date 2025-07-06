import { addDays } from 'date-fns'

export default function DateDisplay({ date }: { date?: Date }) {
  if (!date) {
    date = addDays(new Date(), 1)
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }

  return (
    <h2 className="font-mono text-4xl">
      {date.toLocaleDateString('en-GB', options)}
    </h2>
  )
}
